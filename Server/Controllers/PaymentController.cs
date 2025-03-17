// In PaymentController.cs
using Microsoft.AspNetCore.Mvc;
using Stripe.Checkout;
using Stripe;

[ApiController]
[Route("api/[controller]")]
public class PaymentController : ControllerBase
{
    public PaymentController()
    {
        // Initialize Stripe configuration
        StripeConfiguration.ApiKey = "your_stripe_secret_key";
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
                        Currency = "usd",
                        UnitAmount = (long)(request.Amount * 100), // amount in cents
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = request.ProductName,
                        },
                    },
                    Quantity = 1,
                },
            },
            SuccessUrl = "https://yourdomain.com/success?session_id={CHECKOUT_SESSION_ID}",
            CancelUrl = "https://yourdomain.com/cancel",
        };

        var service = new SessionService();
        Session session = service.Create(options);
        return Ok(new { sessionUrl = session.Url });
    }
}

public class CheckoutSessionRequest
{
    public decimal Amount { get; set; }
    public string ProductName { get; set; }
    // Optionally include store id, category id, etc.
}
// The PaymentController class defines a route for creating a checkout session using the Stripe API. The CreateCheckoutSession method takes a CheckoutSessionRequest object as input, which contains the amount and product name for the session. The method creates a new session with the specified options and returns the session URL to the client.