using Microsoft.AspNetCore.Mvc;
using Stripe;
using Stripe.Checkout;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Stripe.V2;
using System;
using System.Linq; // Added for Select
using Microsoft.EntityFrameworkCore; // Add for DbContext
using System.ComponentModel.DataAnnotations; // Add for model validation
using System.ComponentModel.DataAnnotations.Schema; // Add for model attributes
using Server.Models; // <-- Add this using statement
using Server.Data; // <-- Add this using statement for AppDbContext
using Server.Services; // Assuming IEmailService is in Server.Services - Uncommented
using System.Text;
using Microsoft.AspNetCore.Mvc.ModelBinding.Binders;
using System.Security.Claims; // Added for User Claims
using Microsoft.AspNetCore.Authorization; // Added for [Authorize]

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
    //private readonly IEmailService _emailService; // Inject Email Service - Uncommented

    // Inject AppDbContext and IEmailService
    public PaymentController(IConfiguration configuration, AppDbContext context /* IEmailService emailService */)
    {
        _configuration = configuration;
        _context = context; // Assign injected context
        //_emailService = emailService; // Assign injected email service - Uncommented
        // Load the secret key from configuration (Appsettings.secrets.json)
        StripeConfiguration.ApiKey = _configuration["Stripe:SecretKey"];
    }

    // POST api/payment/create-checkout-session
    [HttpPost("create-checkout-session")]
    [Authorize] // Ensure user is authenticated to get UserId
    public async Task<ActionResult> CreateCheckoutSession([FromBody] CheckoutSessionRequest request) // Make async
    {
        if (request.Items == null || !request.Items.Any())
        {
            return BadRequest("Checkout request must contain items.");
        }

        // --- Get Authenticated User ID ---
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier); // Standard claim type for user ID
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
        {
            // This should not happen if [Authorize] is effective and token is valid
            Console.WriteLine("Error creating order: Could not retrieve or parse User ID from token claims.");
            return Unauthorized("User ID not found in token claims.");
        }
        // --- End Get User ID ---

        // --- Create Order in Database ---
        // Corrected Order instantiation based on Server.Models.Order
        var newOrder = new Order
        {
            StoreId = request.StoreId,
            UserId = userId, // Assign the retrieved User ID
            Status = "Pending",
            CreatedAt = DateTime.UtcNow,
            TotalAmount = request.Items.Sum(item => item.Price * item.Quantity),
            // OrderItems collection will be populated after saving the Order
            // OrderItems = request.Items.Select(item => new OrderItem ... ).ToList() // <-- REMOVE THIS LINE
        };

        _context.Orders.Add(newOrder);
        await _context.SaveChangesAsync(); // Save to get the Order ID

        // Now that newOrder.Id exists, create the OrderItems using the updated constructor
        newOrder.OrderItems = request.Items.Select(item => new OrderItem
        {
            OrderId = newOrder.Id,       // Pass the generated OrderId
            ProductId = item.Id,           // This is the ListingId (Corrected field name)
            Quantity = item.Quantity,     // Pass the Quantity
            UnitPrice = item.Price,        // Pass the Price as UnitPrice
            ProductName = item.Name          // Pass the Name as ProductName
        }).ToList();

        // Associate the items with the order (EF Core might handle this automatically depending on navigation properties)
        // If OrderItems aren't saved automatically, uncomment the line below or ensure Order.OrderItems navigation property is correctly configured.
        // _context.OrderItems.AddRange(newOrder.OrderItems);

        // Save changes again to persist the newly created OrderItems associated with the Order
        await _context.SaveChangesAsync();
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
            },
            SuccessUrl = _configuration["Stripe:SuccessUrl"] ?? "https://localhost:4200/success?session_id={CHECKOUT_SESSION_ID}", // Use configuration or default
            CancelUrl = _configuration["Stripe:CancelUrl"] ?? "https://localhost:4200/cancel", // Use configuration or default
        };

        // --- Construct Cancel URL with storeUrl ---
        string cancelUrlBase = _configuration["Stripe:CancelUrl"] ?? "https://localhost:4200/cancel";
        string cancelUrlWithStore = cancelUrlBase;
        if (!string.IsNullOrEmpty(request.StoreUrl)) // Ensure StoreUrl exists in request
        {
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

    // --- Stripe Webhook Handler ---
    [HttpPost("webhook")]
    [AllowAnonymous] // Needs to be accessible by Stripe
    public async Task<IActionResult> StripeWebhookHandler()
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
        var stripeSignature = Request.Headers["Stripe-Signature"];
        var webhookSecret = _configuration["Stripe:WebhookSecret"]; // Get secret from config (e.g., appsettings.secrets.json)

        if (string.IsNullOrEmpty(webhookSecret))
        {
            Console.WriteLine("Stripe Webhook Error: Webhook secret is not configured.");
            return BadRequest("Webhook secret configuration error.");
        }

        try
        {
            var stripeEvent = EventUtility.ConstructEvent(json, stripeSignature, webhookSecret);

            Console.WriteLine($"Webhook received: {stripeEvent.Type}"); // Log event type

            // Handle the checkout.session.completed event
            if (stripeEvent.Type == "checkout.session.completed")
            {
                var session = stripeEvent.Data.Object as Session;

                if (session == null)
                {
                    Console.WriteLine("Webhook Error: Could not deserialize session object.");
                    return BadRequest("Invalid session object in webhook.");
                }

                // Extract internal order ID from metadata
                if (session.Metadata.TryGetValue("internalOrderId", out var orderIdStr) && int.TryParse(orderIdStr, out var internalOrderId))
                {
                    // Find the order in the database, including its items
                    var order = await _context.Orders
                                              .Include(o => o.OrderItems) // Ensure OrderItems are loaded
                                              .FirstOrDefaultAsync(o => o.Id == internalOrderId);

                    if (order == null)
                    {
                        Console.WriteLine($"Webhook Warning: Order with ID {internalOrderId} not found.");
                        return NotFound($"Order {internalOrderId} not found."); // Return NotFound if order doesn't exist
                    }

                    // Check if the order is still pending (idempotency check)
                    if (order.Status == "Pending")
                    {
                        order.Status = "Paid"; // Or "Processing" depending on your flow
                        order.StripePaymentIntentId = session.PaymentIntentId; // Store Payment Intent ID if needed

                        // Decrease stock for each item in the order
                        foreach (var orderItem in order.OrderItems)
                        {
                            // Assuming OrderItem.ProductId maps to BasicItem.ListId (the product ID)
                            var item = await _context.BasicItem.FindAsync(orderItem.ProductId); // Find the product/listing
                            if (item != null)
                            {
                                // Check if enough stock exists (optional, but recommended)
                                if (item.quantity >= orderItem.Quantity)
                                {
                                    item.quantity -= orderItem.Quantity;
                                }
                                else
                                {
                                    // Handle insufficient stock scenario
                                    Console.WriteLine($"Webhook Warning: Insufficient stock for Item ID {item.ListId} (Product ID: {orderItem.ProductId}) in Order {order.Id}. Requested: {orderItem.Quantity}, Available: {item.quantity}. Setting stock to 0.");
                                    item.quantity = 0; // Or log error, mark order for review, etc.
                                    // Consider adding a note to the order
                                    order.Notes = (order.Notes ?? "") + $"Warning: Insufficient stock for Product ID {orderItem.ProductId}. ";
                                }
                            }
                            else
                            {
                                // Handle item not found scenario
                                Console.WriteLine($"Webhook Error: Item with ID {orderItem.ProductId} not found for OrderItem {orderItem.Id} in Order {order.Id}.");
                                // Consider adding a note to the order
                                order.Notes = (order.Notes ?? "") + $"Error: Product ID {orderItem.ProductId} not found during fulfillment. ";
                            }
                        }

                        // --- Placeholder for Email Sending ---
                        // try
                        // {
                        //     // await _emailService.SendOrderConfirmationEmailAsync(order); // Uncomment when EmailService is ready
                        //     Console.WriteLine($"Placeholder: Would send confirmation email for Order {order.Id}");
                        // }
                        // catch (Exception emailEx)
                        // {
                        //     Console.WriteLine($"Webhook Error: Failed to send confirmation email for Order {order.Id}. Error: {emailEx.Message}");
                        //     // Log this error but don't fail the webhook processing because of email
                        //     order.Notes = (order.Notes ?? "") + $"Error: Failed to send confirmation email. ";
                        // }
                        // --- End Placeholder ---


                        await _context.SaveChangesAsync();
                        Console.WriteLine($"Order {order.Id} status updated to Paid and stock adjusted.");
                    }
                    else
                    {
                        // Order was already processed or has a different status
                        Console.WriteLine($"Webhook Info: Order {order.Id} already processed or not in Pending status (Status: {order.Status}). No action taken.");
                    }
                }
                else
                {
                    Console.WriteLine("Webhook Error: Could not find/parse internalOrderId in session metadata.");
                    return BadRequest("Missing or invalid internalOrderId in metadata.");
                }
            }
            // Handle asynchronous payment failure
            else if (stripeEvent.Type == "checkout.session.async_payment_failed")
            {
                var session = stripeEvent.Data.Object as Session;
                if (session == null)
                {
                    Console.WriteLine("Webhook Error: Could not deserialize session object for async payment failure.");
                    return BadRequest("Invalid session object in webhook for async failure.");
                }

                Console.WriteLine($"Webhook processing: {stripeEvent.Type} for Session ID: {session.Id}");
                await HandleFailedPayment(session.Id, session.Metadata, "Async payment failed");
            }
            // Handle payment intent failure (could be direct PI or PI created by a session)
            else if (stripeEvent.Type == "payment_intent.payment_failed")
            {
                var paymentIntent = stripeEvent.Data.Object as PaymentIntent;
                if (paymentIntent == null)
                {
                    Console.WriteLine("Webhook Error: Could not deserialize PaymentIntent object for payment failure.");
                    return BadRequest("Invalid PaymentIntent object in webhook for failure.");
                }

                Console.WriteLine($"Webhook processing: {stripeEvent.Type} for Payment Intent ID: {paymentIntent.Id}");
                // Pass PaymentIntent.Id as the first argument (instead of session ID)
                await HandleFailedPayment(paymentIntent.Id, paymentIntent.Metadata, paymentIntent.LastPaymentError?.Message ?? "Payment failed");
            }
            // Handle other event types
            else
            {
                Console.WriteLine($"Unhandled event type: {stripeEvent.Type}");
            }

            return Ok();
        }
        catch (StripeException e)
        {
            Console.WriteLine($"Stripe Webhook Error: {e.Message}");
            return BadRequest($"Stripe webhook signature error: {e.Message}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Webhook Processing Error: {ex.Message}");
            // Log the full exception details if needed
            // Console.WriteLine(ex.ToString());
            return StatusCode(500, "Internal server error during webhook processing.");
        }
    }

    // --- Helper Method for Failed Payments ---
    // Modified to handle lookup by SessionId, PaymentIntentId, or internalOrderId from metadata
    private async Task HandleFailedPayment(string? identifier, Dictionary<string, string>? metadata, string failureReason)
    {
        Console.WriteLine($"HandleFailedPayment called. Identifier: {identifier}, Reason: {failureReason}");
        Order? order = null;

        // 1. Try finding order by internalOrderId in metadata (most reliable if present)
        if (metadata != null && metadata.TryGetValue("internalOrderId", out var orderIdStr) && int.TryParse(orderIdStr, out var internalOrderId))
        {
            Console.WriteLine($"Attempting lookup by internalOrderId from metadata: {internalOrderId}");
            order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == internalOrderId);
        }

        // 2. If not found via metadata and identifier looks like a session ID (cs_...)
        if (order == null && identifier?.StartsWith("cs_") == true)
        {
            Console.WriteLine($"Attempting lookup by StripeSessionId: {identifier}");
            order = await _context.Orders.FirstOrDefaultAsync(o => o.StripeSessionId == identifier);
        }
        // 3. If not found via metadata or session ID, and identifier looks like a payment intent ID (pi_...)
        // IMPORTANT: This relies on the Order model having a StripePaymentIntentId field,
        // which should be populated during the checkout.session.completed event.
        // If the field doesn't exist, this lookup will fail or cause an error.
        else if (order == null && identifier?.StartsWith("pi_") == true)
        {
            Console.WriteLine($"Attempting lookup by StripePaymentIntentId: {identifier}");
             // Check if the Order model actually has StripePaymentIntentId before uncommenting/using this.
             // If Order model was updated as per the checkout.session.completed logic, this should work.
             order = await _context.Orders.FirstOrDefaultAsync(o => o.StripePaymentIntentId == identifier);
             // --- Temporary Workaround/Placeholder if StripePaymentIntentId doesn't exist yet ---
             // If StripePaymentIntentId is not yet on the Order model, we cannot directly link
             // payment_intent.failed events reliably without metadata. Log this issue.
             // Console.WriteLine("WARNING: Lookup by StripePaymentIntentId skipped. Verify Order model has StripePaymentIntentId field and it's populated.");
             // You might need alternative logic here, e.g., querying related Sessions if PI metadata is empty.
             // For now, we proceed without finding the order via PI ID if the field is missing.
        }

        if (order != null)
        {
            // Check if already failed to avoid redundant updates
            if (order.Status != "Failed")
            {
                Console.WriteLine($"Order found (ID: {order.Id}). Updating status to Failed.");
                order.Status = "Failed";
                // Append failure reason to notes, preserving existing notes
                order.Notes = string.IsNullOrEmpty(order.Notes)
                    ? $"Payment Failed: {failureReason}"
                    : $"{order.Notes} | Payment Failed: {failureReason}";

                await _context.SaveChangesAsync();
                Console.WriteLine($"Order {order.Id} status updated to Failed.");
            }
            else
            {
                Console.WriteLine($"Order {order.Id} already marked as Failed. No status change needed.");
            }
        }
        else
        {
            Console.WriteLine($"HandleFailedPayment Warning: Could not find corresponding order for identifier '{identifier}' or associated metadata.");
            // Consider logging more details from metadata if available
            if (metadata != null && metadata.Any())
            {
                var metaDetails = string.Join(", ", metadata.Select(kv => $"{kv.Key}={kv.Value}"));
                Console.WriteLine($"Metadata received: {metaDetails}");
            }
        }
    }
    // --- End Helper Method ---
}

// --- Request/Response Models used by PaymentController Actions ---

// Request model for creating a checkout session
public class CheckoutSessionRequest
{
    public required List<CheckoutItem> Items { get; set; }
    public int StoreId { get; set; }
    // public int CategoryId { get; set; } // If needed, uncomment
    public required string StoreUrl { get; set; } 
}

// Represents a single item in the checkout request/response
public class CheckoutItem
{
    public int Id { get; set; } // Represents the BasicItem.ListId (product primary key)
    public required string Name { get; set; }
    public decimal Price { get; set; }
    public int Quantity { get; set; }
}

// --- Removed Commented Out Webhook Controller and trailing models to resolve parsing issues ---
// Webhook controller logic should be in its own file (e.g., WebhookController.cs) if reinstated.

