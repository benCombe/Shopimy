using Microsoft.AspNetCore.Mvc;
using Stripe;
using Stripe.Checkout;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using System;
using System.Linq; // Added for Select


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

        var lineItems = request.Items.Select(item => new SessionLineItemOptions
        {
            PriceData = new SessionLineItemPriceDataOptions
            {
                Currency = "cad",
                UnitAmount = (long)(item.Price * 100), // amount in cents
                ProductData = new SessionLineItemPriceDataProductDataOptions
                {
                    Name = item.Name,
                },
            },
            Quantity = item.Quantity,
        }).ToList();

        var options = new SessionCreateOptions
        {
            PaymentMethodTypes = new List<string> { "card" },
            Mode = "payment",
            LineItems = lineItems, // Use the generated list of line items
            Metadata = new Dictionary<string, string>
            { 
                // Keep existing metadata, potentially add orderId here later
                { "storeId", request.StoreId.ToString() },
                { "categoryId", request.CategoryId.ToString() } 
                // { "orderId", your_internal_order_id.ToString() }
            },
            SuccessUrl = _configuration["Stripe:SuccessUrl"] ?? "https://localhost:4200/success?session_id={CHECKOUT_SESSION_ID}", // Use configuration or default
            CancelUrl = _configuration["Stripe:CancelUrl"] ?? "https://localhost:4200/cancel", // Use configuration or default
            // Consider adding customer_email or linking to a Stripe Customer if user is logged in
            // CustomerEmail = request.CustomerEmail, // If you add CustomerEmail to CheckoutSessionRequest
            // Customer = stripeCustomerId, // If user is logged in and has Stripe Customer ID
        };

        var service = new SessionService();
        Session session = service.Create(options);

        return Ok(new { sessionId = session.Id, sessionUrl = session.Url }); // Return Session ID as well
    }

    // POST api/payment/webhook
    [HttpPost("webhook")]
    public async Task<IActionResult> Webhook()
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
        // Retrieve the webhook secret from configuration
        var webhookSecret = _configuration["Stripe:WebhookSecret"];
        if (string.IsNullOrEmpty(webhookSecret))
        {
            Console.WriteLine("Stripe Webhook Secret not configured.");
            return BadRequest(); // Or InternalServerError
        }

        try
        {
            var stripeEvent = EventUtility.ConstructEvent(json, Request.Headers["Stripe-Signature"], webhookSecret);

            // Handle the event
            if (stripeEvent.Type == "checkout.session.completed")
            {
                var session = stripeEvent.Data.Object as Session;

                Console.WriteLine($"Webhook received: CheckoutSessionCompleted, Session ID: {session?.Id}");

                // --- Order Fulfillment Logic --- 
                // 1. Check if you've already processed this event (optional but recommended)
                //    - Look up session.Id in a table of processed events/orders.
                //    - If found, return Ok() to acknowledge receipt without reprocessing.

                // 2. Retrieve Order details (using metadata or session details)
                //    - Example using metadata: 
                //      if (session.Metadata.TryGetValue("orderId", out var orderIdStr) && int.TryParse(orderIdStr, out var orderId))
                //      { ... find order by orderId ... } 
                //    - Or retrieve customer details: session.CustomerId, session.CustomerEmail

                // 3. Verify Payment Status (optional, but good practice)
                if (session?.PaymentStatus == "paid")
                {
                    Console.WriteLine("Payment successful.");
                    // TODO: Implement your order fulfillment logic here:
                    // - Find the corresponding order in your database.
                    // - Update the order status to 'Paid' or 'Processing'.
                    // - Decrease stock levels for purchased items.
                    // - Send a confirmation email to the customer.
                    // - Trigger shipping processes if applicable.
                    // - Record the successful processing of this event.

                    // Example placeholder call:
                    // await _orderService.FulfillOrder(session); 
                    Console.WriteLine("Placeholder: Order fulfillment logic executed.");
                }
                else
                {
                     Console.WriteLine($"Payment status is {session?.PaymentStatus}. Order not fulfilled.");
                     // Handle cases like 'unpaid' if necessary (e.g., log it)
                }
            }
            // ... handle other event types (e.g., payment_intent.succeeded, payment_intent.payment_failed)
            else
            {
                Console.WriteLine($"Unhandled event type: {stripeEvent.Type}");
            }

            // Return a 200 OK response to Stripe to acknowledge receipt of the event
            return Ok();
        }
        catch (StripeException e)
        {
            Console.WriteLine($"Stripe Webhook Error: {e.Message}");
            return BadRequest();
        }
         catch (Exception e)
        {
            Console.WriteLine($"Webhook General Error: {e.Message}");
            return StatusCode(500); // Internal Server Error
        }
    }
}

// Request model for creating a checkout session
public class CheckoutSessionRequest
{
    // Removed Amount and ProductName
    // public decimal Amount { get; set; }
    // public required string ProductName { get; set; }

    public required List<CheckoutItem> Items { get; set; } // List of items in the cart
    public int StoreId { get; set; } // Kept for metadata, might be derivable from items later
    public int CategoryId { get; set; } // Kept for metadata, might be derivable from items later
    // public string CustomerEmail { get; set; } // Optional: Pass customer email
}

// Represents a single item in the checkout request
public class CheckoutItem
{
    public int Id { get; set; }       // Internal ID of the item/variant
    public required string Name { get; set; } // Name to display in Stripe
    public decimal Price { get; set; } // Price per unit
    public int Quantity { get; set; }  // Quantity being purchased
}

    // Optionally include additional fields e.g., customer email or description
    // public string CustomerEmail { get; set; }

