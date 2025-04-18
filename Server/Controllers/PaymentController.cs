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
    private readonly IEmailService _emailService; // Inject Email Service - Uncommented

    // Inject AppDbContext and IEmailService
    public PaymentController(IConfiguration configuration, AppDbContext context, IEmailService emailService /* - Uncommented */)
    {
        _configuration = configuration;
        _context = context; // Assign injected context
        _emailService = emailService; // Assign injected email service - Uncommented
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
        newOrder.OrderItems = request.Items.Select(item => new OrderItem(
            newOrder.Id,       // Pass the generated OrderId
            item.Id,           // This is the ListingId
            item.Quantity,     // Pass the Quantity
            item.Price,        // Pass the Price as UnitPrice
            item.Name          // Pass the Name as ProductName
        )).ToList();

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
            if (stripeEvent.Type == Events.CheckoutSessionCompleted)
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
                            // Assuming OrderItem.ItemId maps to BasicItem.ListId (the product ID)
                            var item = await _context.BasicItem.FindAsync(orderItem.ItemId); // Find the product/listing
                            if (item != null)
                            {
                                // Check if enough stock exists (optional, but recommended)
                                if (item.Quantity >= orderItem.Quantity)
                                {
                                    item.Quantity -= orderItem.Quantity;
                                }
                                else
                                {
                                    // Handle insufficient stock scenario
                                    Console.WriteLine($"Webhook Warning: Insufficient stock for Item ID {item.ListId} in Order {order.Id}. Requested: {orderItem.Quantity}, Available: {item.Quantity}. Setting stock to 0.");
                                    item.Quantity = 0; // Or log error, mark order for review, etc.
                                    // Consider adding a note to the order
                                    order.Notes = (order.Notes ?? "") + $"Warning: Insufficient stock for Item ID {item.ListId}. ";
                                }
                            }
                            else
                            {
                                // Handle item not found scenario
                                Console.WriteLine($"Webhook Error: Item with ID {orderItem.ItemId} not found for OrderItem {orderItem.Id} in Order {order.Id}.");
                                // Consider adding a note to the order
                                order.Notes = (order.Notes ?? "") + $"Error: Item ID {orderItem.ItemId} not found during fulfillment. ";
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
            // --- Optional: Handle Payment Failed Event ---
            // else if (stripeEvent.Type == Events.CheckoutSessionAsyncPaymentFailed || stripeEvent.Type == Events.PaymentIntentPaymentFailed)
            // {
            //     Session session = null;
            //     Dictionary<string, string> metadata = null;
            //     string failureReason = "Unknown";
            //     string sessionId = null; // For logging

            //     if (stripeEvent.Data.Object is Session failedSession) {
            //         session = failedSession;
            //         metadata = session.Metadata;
            //         sessionId = session.Id;
            //         failureReason = session.Status.ToString(); // Or more specific reason if available
            //     } else if (stripeEvent.Data.Object is PaymentIntent failedPaymentIntent) {
            //         // Attempt to get metadata if linked to a session, might require fetching the session
            //         // This part can be complex if PaymentIntent isn't directly linked via metadata easily
            //         // For simplicity, we rely on metadata from the event context if possible,
            //         // or fetch related session if needed (adds complexity/latency).
            //         // metadata = ... // Fetch metadata if possible
            //         failureReason = failedPaymentIntent.Status.ToString(); // Or LastPaymentError details
            //         // sessionId = ... // Potentially extract from related charge/session if possible
            //     }

            //     await HandleFailedPayment(sessionId, metadata, failureReason);
            // }
            // --- End Optional Failure Handling ---
            else
            {
                Console.WriteLine($"Webhook Info: Unhandled event type: {stripeEvent.Type}");
                // You might want to handle other event types here
            }

            return Ok(); // Return 200 OK to Stripe
        }
        catch (StripeException e)
        {
            Console.WriteLine($"Stripe Webhook Error: {e.Message}");
            return BadRequest($"Webhook error: {e.Message}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Webhook Internal Server Error: {ex.Message}");
            // Log the full exception details for debugging
            Console.WriteLine(ex.ToString());
            return StatusCode(500, "Internal server error");
        }
    }

    // --- Helper method to handle failed payments (Moved inside PaymentController) ---
    private async Task HandleFailedPayment(string? sessionId, Dictionary<string, string>? metadata, string failureReason)
    {
        Console.WriteLine($"Handling failed payment. Session ID: {sessionId}, Reason: {failureReason}");
        if (metadata != null && metadata.TryGetValue("internalOrderId", out var orderIdStr) && int.TryParse(orderIdStr, out var internalOrderId))
        {
             var order = await _context.Orders.FindAsync(internalOrderId); // Use injected _context
             if (order != null)
             {
                 if (order.Status == "Pending")
                 {
                     order.Status = "Failed";
                     order.Notes = $"Payment failed: {failureReason}"; // Use Notes property added earlier
                     await _context.SaveChangesAsync(); // Use injected _context
                     Console.WriteLine($"Updated Order {internalOrderId} status to Failed due to: {failureReason}");
                 }
                 else
                 {
                     Console.WriteLine($"Order {internalOrderId} was not in Pending status (Status: {order.Status}). No update made for failure.");
                 }
             }
             else
             {
                  Console.WriteLine($"Webhook Warning: Order with ID {internalOrderId} not found during failure handling.");
             }
        }
        else
        {
             Console.WriteLine($"Webhook Warning: Could not find/parse internalOrderId in metadata for failed payment session {sessionId}.");
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

