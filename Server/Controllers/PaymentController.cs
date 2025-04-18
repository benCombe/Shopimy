using Microsoft.AspNetCore.Mvc;
using Stripe;
using Stripe.Checkout;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Stripe.V2;

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
        // TODO: Ideally, create an Order in your database here with a 'Pending' status
        //       and pass the Order ID in the session metadata. This helps link the 
        //       Stripe session back to your internal order when the webhook is received.
        //       Example: metadata.Add("orderId", newOrder.Id.ToString());

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
                    Quantity = 1, // Assuming quantity 1, adjust if needed
                },
            },
            Metadata = new Dictionary<string, string>
            { 
                // Add your internal identifiers here if needed
                { "storeId", request.StoreId.ToString() },
                { "categoryId", request.CategoryId.ToString() }
                // { "orderId", your_internal_order_id.ToString() }
            },
            SuccessUrl = "https://shopimy.com/success?session_id={CHECKOUT_SESSION_ID}", // Use environment variables for URLs
            CancelUrl = "https://shopimy.com/cancel", // Use environment variables for URLs
            // Consider adding customer_email or linking to a Stripe Customer if user is logged in
            // Customer = stripeCustomerId, // If user is logged in and has Stripe Customer ID
        };

        var service = new SessionService();
        Session session = service.Create(options);

        return Ok(new { sessionUrl = session.Url });
    }
}

//UNCOMMENT WHEN FIXED
/* [ApiController]
[Route("api/[controller]")]
public class WebhookController : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Index()
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
        // You can find your webhook secret in your Stripe dashboard
        var webhookSecret = "your_webhook_secret"; //not sure yet
        Event stripeEvent; //UNCOMMENT WHEN FIXED

        try
        {
            stripeEvent = EventUtility.ConstructEvent(json, Request.Headers["Stripe-Signature"], webhookSecret);
        }
        catch (Exception ex)
        {
            // Invalid signature
            return BadRequest();
        }

        
        // Handle the event (e.g., checkout.session.completed)
        if (stripeEvent.Type == Event.CheckoutSessionCompleted)
        {
            //var session = stripeEvent.Data.Object as Session;
            // Fulfill the purchase, update order status in your database, etc.
        }

        return Ok();
    }
}
 */
public class CheckoutSessionRequest
{
    public decimal Amount { get; set; }
    public required string ProductName { get; set; }
    public int StoreId { get; set; }
    public int CategoryId { get; set; }
    // Optionally include additional fields such as CustomerEmail, etc.
}

    // Optionally include additional fields e.g., customer email or description
    // public string CustomerEmail { get; set; }
