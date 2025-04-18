using Microsoft.AspNetCore.Mvc;
using Stripe;
using Stripe.Checkout;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using System;
using System.Linq; // Added for Select
using Microsoft.EntityFrameworkCore; // Add for DbContext
using System.ComponentModel.DataAnnotations; // Add for model validation
using System.ComponentModel.DataAnnotations.Schema; // Add for model attributes
using Server.Models; // <-- Add this using statement
using Server.Data; // <-- Add this using statement for AppDbContext

// --- Placeholder Models (Adjust or move as needed based on actual project structure) ---
// [Remove Order class definition]
// [Remove OrderItem class definition]
// --- End Placeholder Models ---

[ApiController]
[Route("api/[controller]")]
public class PaymentController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly AppDbContext _context; // Inject DbContext

    // Inject AppDbContext
    public PaymentController(IConfiguration configuration, AppDbContext context)
    {
        _configuration = configuration;
        _context = context; // Assign injected context
        // Load the secret key from configuration (Appsettings.secrets.json)
        StripeConfiguration.ApiKey = _configuration["Stripe:SecretKey"];
    }

    // POST api/payment/create-checkout-session
    [HttpPost("create-checkout-session")]
    public async Task<ActionResult> CreateCheckoutSession([FromBody] CheckoutSessionRequest request) // Make async
    {
        if (request.Items == null || !request.Items.Any())
        {
            return BadRequest("Checkout request must contain items.");
        }

        // --- Create Order in Database ---
        var newOrder = new Order
        {
            StoreId = request.StoreId, // Assuming StoreId is passed in request
            Status = "Pending",
            CreatedAt = DateTime.UtcNow,
            TotalAmount = request.Items.Sum(item => item.Price * item.Quantity),
            OrderItems = request.Items.Select(item => new OrderItem
            {
                ProductId = item.Id,
                ProductName = item.Name,
                Quantity = item.Quantity,
                UnitPrice = item.Price
            }).ToList()
        };

        _context.Orders.Add(newOrder);
        await _context.SaveChangesAsync(); // Save to get the Order ID
        // --- End Order Creation ---


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
                { "internalOrderId", newOrder.Id.ToString() }, // <-- Add internal Order ID here
                { "storeId", request.StoreId.ToString() }
                // { "categoryId", request.CategoryId.ToString() } // CategoryId might be less relevant here now
            },
            SuccessUrl = _configuration["Stripe:SuccessUrl"] ?? "https://localhost:4200/success?session_id={CHECKOUT_SESSION_ID}", // Use configuration or default
            CancelUrl = _configuration["Stripe:CancelUrl"] ?? "https://localhost:4200/cancel", // Use configuration or default
            // Consider adding customer_email or linking to a Stripe Customer if user is logged in
            // CustomerEmail = request.CustomerEmail, // If you add CustomerEmail to CheckoutSessionRequest
            // Customer = stripeCustomerId, // If user is logged in and has Stripe Customer ID
        };

        // --- Construct Cancel URL with storeUrl --- 
        string cancelUrlBase = _configuration["Stripe:CancelUrl"] ?? "https://localhost:4200/cancel";
        string cancelUrlWithStore = cancelUrlBase;
        if (!string.IsNullOrEmpty(request.StoreUrl)) // Ensure StoreUrl exists in request
        {
            // Basic check to see if URL already has query params
            cancelUrlWithStore = cancelUrlBase.Contains("?") 
                ? $"{cancelUrlBase}&storeUrl={Uri.EscapeDataString(request.StoreUrl)}" 
                : $"{cancelUrlBase}?storeUrl={Uri.EscapeDataString(request.StoreUrl)}";
        }
        options.CancelUrl = cancelUrlWithStore; // Use the updated CancelUrl
        // --- End Cancel URL construction ---

        var service = new SessionService();
        Session session = service.Create(options);

        // --- Update Order with Stripe Session ID ---
        newOrder.StripeSessionId = session.Id;
        await _context.SaveChangesAsync();
        // --- End Update ---

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
                //    - Look up session.Id or metadata.orderId to see if order status is already 'Paid'/'Processing'.
                //    - If already processed, return Ok().

                // 2. Retrieve Order details using metadata
                int? internalOrderId = null;
                if (session?.Metadata.TryGetValue("internalOrderId", out var orderIdStr) == true && int.TryParse(orderIdStr, out var parsedOrderId))
                {
                   internalOrderId = parsedOrderId;
                   Console.WriteLine($"Found internalOrderId in metadata: {internalOrderId}");
                }
                else
                {
                   Console.WriteLine($"Webhook Error: Could not find/parse internalOrderId in metadata for session {session?.Id}.");
                   // Potentially try to find order via session.Id if you stored it, but metadata is preferred.
                   return BadRequest("Missing orderId metadata."); // Acknowledge receipt but indicate error
                }

                // 3. Verify Payment Status
                if (session?.PaymentStatus == "paid")
                {
                    Console.WriteLine("Payment successful.");
                    // Find the order
                    var order = await _context.Orders.FindAsync(internalOrderId); // Requires internalOrderId to be non-null

                    if (order == null)
                    {
                        Console.WriteLine($"Webhook Error: Order with ID {internalOrderId} not found.");
                        return NotFound($"Order {internalOrderId} not found.");
                    }

                    // Idempotency check: Only fulfill if status is still Pending (or relevant initial state)
                    if (order.Status == "Pending")
                    {
                        // --- Implement Fulfillment ---
                        order.Status = "Paid"; // Or "Processing" if there are further steps
                        // TODO: Decrease stock levels for purchased items (using order.OrderItems).
                        // TODO: Send a confirmation email to the customer.
                        // TODO: Trigger shipping processes if applicable.
                        // TODO: Record the successful processing of this event (e.g., log, update timestamp).
                        await _context.SaveChangesAsync();
                        Console.WriteLine($"Order {internalOrderId} status updated to {order.Status}.");
                        // Example placeholder call:
                        // await _orderService.FulfillOrder(order);
                        Console.WriteLine("Placeholder: Order fulfillment logic executed.");
                    }
                    else
                    {
                        Console.WriteLine($"Webhook Info: Order {internalOrderId} already processed (status: {order.Status}). Acknowledging event.");
                    }
                }
                else
                {
                     Console.WriteLine($"Payment status is {session?.PaymentStatus} for order {internalOrderId}. Order not fulfilled.");
                     // Optionally update order status to reflect the unpaid status if needed.
                }
            }
            // --- Handle Payment Failure Events ---
            else if (stripeEvent.Type == "checkout.session.async_payment_failed")
            {
                 var session = stripeEvent.Data.Object as Session;
                 Console.WriteLine($"Webhook received: AsyncPaymentFailed, Session ID: {session?.Id}");
                 await HandleFailedPayment(session?.Id, session?.Metadata, "Async payment failed");
            }
            else if (stripeEvent.Type == "payment_intent.payment_failed")
            {
                var paymentIntent = stripeEvent.Data.Object as PaymentIntent;
                Console.WriteLine($"Webhook received: PaymentIntentFailed, PaymentIntent ID: {paymentIntent?.Id}");
                // PaymentIntents might not have the same metadata as the session directly.
                // You might need to retrieve the session associated with the payment intent if metadata isn't copied,
                // or look up the order based on the PaymentIntent ID if you store it.
                // For simplicity, we'll assume session metadata is sufficient or Session ID can be retrieved if needed.
                // If the session ID isn't directly available, you might need more complex logic here.
                // Let's assume for now we can get the order ID from associated session metadata if needed
                // (This might require adjusting how metadata is linked or retrieved)

                // Placeholder: Attempt to find related session/order if needed.
                // var relatedSession = FindSessionForPaymentIntent(paymentIntent.Id);
                // await HandleFailedPayment(relatedSession?.Id, relatedSession?.Metadata, paymentIntent?.LastPaymentError?.Message ?? "Payment failed");

                // Simplified: If the Checkout Session ID is linked (often is), use that.
                var checkoutSessionId = paymentIntent?.LatestCharge?.PaymentIntent?.Id; // Check if session ID is linked
                 Console.WriteLine($"Attempting to handle failure based on PaymentIntent {paymentIntent?.Id}. Checkout Session ID linked: {checkoutSessionId}");
                 // For now, we log and acknowledge. Robust handling might require linking PaymentIntent ID to Order.
                 // TODO: Implement robust linking/lookup if PaymentIntent failures need specific order updates.
                 Console.WriteLine($"Warning: Direct order update from payment_intent.failed not fully implemented without order/PI linkage.");

            }
            // --- End Handle Payment Failure Events ---
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

    // --- Helper method to handle failed payments ---
    private async Task HandleFailedPayment(string? sessionId, Dictionary<string, string>? metadata, string failureReason)
    {
        if (metadata == null || !metadata.TryGetValue("internalOrderId", out var orderIdStr) || !int.TryParse(orderIdStr, out var internalOrderId))
        {
            Console.WriteLine($"Webhook Error: Could not find/parse internalOrderId in metadata for failed session {sessionId}. Reason: {failureReason}");
            // Cannot update order without ID. Consider logging to an alert system.
            return;
        }

        Console.WriteLine($"Processing failed payment for Order ID: {internalOrderId}, Session ID: {sessionId}, Reason: {failureReason}");

        var order = await _context.Orders.FindAsync(internalOrderId);
        if (order == null)
        {
            Console.WriteLine($"Webhook Error: Order with ID {internalOrderId} not found for failed payment.");
            return; // Order doesn't exist, can't update.
        }

        // Idempotency check: Only update if the order is still in a state where failure makes sense (e.g., Pending)
        if (order.Status == "Pending")
        {
            order.Status = "Failed"; // Update status to Failed
            // TODO: Add more details about the failure to the order if your schema allows (e.g., a failure reason field).
            // TODO: Consider if stock needs to be "released" back if it was reserved.
            await _context.SaveChangesAsync();
            Console.WriteLine($"Order {internalOrderId} status updated to Failed.");
            // TODO: Consider sending an internal notification about the failed payment.
        }
        else
        {
             Console.WriteLine($"Webhook Info: Order {internalOrderId} not updated. Current status ({order.Status}) is not 'Pending'. Failed payment event ignored/logged.");
        }
    }
    // --- End Helper Method ---
}

// Request model for creating a checkout session
public class CheckoutSessionRequest
{
    // Removed Amount and ProductName
    // public decimal Amount { get; set; }
    // public required string ProductName { get; set; }

    public required List<CheckoutItem> Items { get; set; } // List of items in the cart
    public int StoreId { get; set; } // Kept for metadata, might be derivable from items later
    // public int CategoryId { get; set; } // Removed CategoryId as it might be less relevant here
    public required string StoreUrl { get; set; } // Added StoreUrl to pass to CancelComponent
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

