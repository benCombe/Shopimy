using Microsoft.AspNetCore.Mvc;
using Stripe.Checkout;
using Stripe;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class PaymentController : ControllerBase
{
    public PaymentController()
    {
        // Initialize Stripe configuration
        StripeConfiguration.ApiKey = "sk_test_51R3l1P2fQMpcECcW3YEiegl49lbNeD2ZQA9CU3f5261hnND6qHNrUe9rqfQ4v3GlgFaSiZIFROSLHxxQSwoaQopf00RzkpCJBL";
    }

    [HttpPost("create-checkout-session")]
    public ActionResult CreateCheckoutSession([FromBody] CheckoutSessionRequest request)
    {
        // Create options for the session
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
            // Attach additional data as metadata so you can reference them in webhooks or later in the dashboard.
            Metadata = new Dictionary<string, string>
            {
                { "storeId", request.StoreId.ToString() },
                { "categoryId", request.CategoryId.ToString() }
                // You can add other fields here, e.g. { "customerEmail", request.CustomerEmail }
            },
            SuccessUrl = "https://shopimy.com/success?session_id={CHECKOUT_SESSION_ID}",
            CancelUrl = "https://shopimy.com/cancel",
        };

        var service = new SessionService();
        Session session = service.Create(options);
        return Ok(new { sessionUrl = session.Url });
    }
}

[ApiController]
[Route("api/[controller]")]
public class WebhookController : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Index()
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
        // You can find your webhook secret in your Stripe dashboard
        var webhookSecret = "your_webhook_secret"; //not sure yet
        Event stripeEvent;

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
        if (stripeEvent.Type == Events.CheckoutSessionCompleted)
        {
            var session = stripeEvent.Data.Object as Session;
            // Fulfill the purchase, update order status in your database, etc.
        }

        return Ok();
    }
}

public class CheckoutSessionRequest
{
    public decimal Amount { get; set; }
    public string ProductName { get; set; }
    public int StoreId { get; set; }
    public int CategoryId { get; set; }
    // Optionally include additional fields e.g., customer email or description
    // public string CustomerEmail { get; set; }
}