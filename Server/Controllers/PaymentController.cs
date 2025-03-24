using Microsoft.AspNetCore.Mvc;
using Stripe;
using Stripe.Checkout;

[ApiController]
[Route("api/[controller]")]
public class PaymentController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public PaymentController(IConfiguration configuration)
    {
        _configuration = configuration;
        // Load the secret key from configuration (Appsettings.secrets.json)
        StripeConfiguration.ApiKey = _configuration["Stripe:SecretKey"];
    }

    // POST api/payment/create-checkout-session
    [HttpPost("create-checkout-session")]
    public ActionResult CreateCheckoutSession([FromBody] CheckoutSessionRequest request)
    {
        var options = new SessionCreateOptions
        {
            PaymentMethodTypes = new List<string> { "card" },
            Mode = "payment",
            LineItems = new List<SessionLineItemOptions>
            {
                new SessionLineItemOptions
                {
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        Currency = "cad",
                        UnitAmount = (long)(request.Amount * 100), // amount in cents
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = request.ProductName,
                        },
                    },
                    Quantity = 1,
                },
            },
            Metadata = new Dictionary<string, string>
            {
                { "storeId", request.StoreId.ToString() },
                { "categoryId", request.CategoryId.ToString() }
            },
            SuccessUrl = "https://shopimy.com/success?session_id={CHECKOUT_SESSION_ID}",
            CancelUrl = "https://shopimy.com/cancel",
        };

        var service = new SessionService();
        Session session = service.Create(options);

        return Ok(new { sessionUrl = session.Url });
    }

    // POST api/payment/webhook
    [HttpPost("webhook")]
    public async Task<IActionResult> Webhook()
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
        // Retrieve the webhook secret from configuration
        var webhookSecret = _configuration["Stripe:WebhookSecret"];
        Event stripeEvent;

        try
        {
            stripeEvent = EventUtility.ConstructEvent(json, Request.Headers["Stripe-Signature"], webhookSecret);
        }
        catch (Exception ex)
        {
            // Invalid signature – return a 400 error
            return BadRequest();
        }

        // Handle the event (for example, checkout.session.completed)
        if (stripeEvent.Type == "checkout.session.completed")
        {
            var session = stripeEvent.Data.Object as Session;
            // Fulfill the purchase, update order status in your database, etc.
            // For example:
            // OrderService.FulfillOrder(session.Id, session.Metadata["storeId"]);
        }

        return Ok();
    }
}

public class CheckoutSessionRequest
{
    public decimal Amount { get; set; }
    public required string ProductName { get; set; }
    public int StoreId { get; set; }
    public int CategoryId { get; set; }
    // Optionally include additional fields such as CustomerEmail, etc.
}
