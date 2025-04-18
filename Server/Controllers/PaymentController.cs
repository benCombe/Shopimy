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
// using Server.Services; // Assuming IEmailService is in Server.Services - Commented out for now
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
    // private readonly IEmailService _emailService; // Inject Email Service - Commented out for now

    // Inject AppDbContext and IEmailService
    public PaymentController(IConfiguration configuration, AppDbContext context /*, IEmailService emailService - Commented out */)
    {
        _configuration = configuration;
        _context = context; // Assign injected context
        // _emailService = emailService; // Assign injected email service - Commented out for now
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
        var newOrder = new Order
        {
            StoreId = request.StoreId,
            UserId = userId, // Assign the retrieved User ID
            Status = "Pending",
            CreatedAt = DateTime.UtcNow,
            TotalAmount = request.Items.Sum(item => item.Price * item.Quantity),
            OrderItems = request.Items.Select(item => new OrderItem
            {
                // Use ProductId (int) as identified in OrderItem model (maps to BasicItem.ListId)
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

    // POST api/payment/webhook
    [HttpPost("webhook")]
    public async Task<IActionResult> Webhook()
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
        var webhookSecret = _configuration["Stripe:WebhookSecret"];
        if (string.IsNullOrEmpty(webhookSecret))
        {
            Console.WriteLine("Stripe Webhook Secret not configured.");
            return BadRequest();
        }

        try
        {
            var stripeEvent = EventUtility.ConstructEvent(json, Request.Headers["Stripe-Signature"], webhookSecret);

            if (stripeEvent.Type == "checkout.session.completed")
            {
                var session = stripeEvent.Data.Object as Session;
                Console.WriteLine($"Webhook received: CheckoutSessionCompleted, Session ID: {session?.Id}");

                int? internalOrderId = null;
                if (session?.Metadata.TryGetValue("internalOrderId", out var orderIdStr) == true && int.TryParse(orderIdStr, out var parsedOrderId))
                {
                   internalOrderId = parsedOrderId;
                   Console.WriteLine($"Found internalOrderId in metadata: {internalOrderId}");
                }
                else
                {
                   Console.WriteLine($"Webhook Error: Could not find/parse internalOrderId in metadata for session {session?.Id}.");
                   return BadRequest("Missing orderId metadata.");
                }

                if (session?.PaymentStatus == "paid")
                {
                    Console.WriteLine("Payment successful.");
                    // Find the order - Include OrderItems and User
                    var order = await _context.Orders
                                        .Include(o => o.OrderItems)
                                        .Include(o => o.User)
                                        .FirstOrDefaultAsync(o => o.Id == internalOrderId);

                    if (order == null)
                    {
                        Console.WriteLine($"Webhook Error: Order with ID {internalOrderId} not found.");
                        return NotFound($"Order {internalOrderId} not found.");
                    }

                    if (order.Status == "Pending")
                    {
                        // --- Implement Fulfillment ---
                        order.Status = "Paid";

                        // --- 1. Decrease Stock ---
                        foreach (var orderItem in order.OrderItems)
                        {
                            var basicItem = await _context.BasicItem.FindAsync(orderItem.ProductId);
                            if (basicItem != null)
                            {
                                basicItem.quantity -= orderItem.Quantity;
                                if (basicItem.quantity < 0)
                                {
                                    Console.WriteLine($"Warning: Stock for ListId {basicItem.ListId} (Product ID {orderItem.ProductId}) went negative after fulfilling Order ID {order.Id}. New Quantity: {basicItem.quantity}");
                                    // basicItem.quantity = 0; // Optional: Clamp to zero
                                }
                                _context.BasicItem.Update(basicItem);
                            }
                            else
                            {
                                Console.WriteLine($"Warning: Item with Product ID {orderItem.ProductId} not found in BasicItem/Listing table while trying to decrease stock for Order ID {order.Id}.");
                            }
                        }

                        await _context.SaveChangesAsync(); // Save stock updates and order status change
                        Console.WriteLine($"Order {internalOrderId} status updated to {order.Status}. Stock levels adjusted.");

                        // --- 2. Send Confirmation Email - Commented out for now ---
                        /* 
                        if (order.User != null)
                        {
                            try
                            {
                                await _emailService.SendOrderConfirmationEmailAsync(order.User, order);
                                Console.WriteLine($"Order confirmation email initiated for Order ID {order.Id} to {order.User.Email}.");
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine($"Error sending order confirmation email for Order ID {order.Id}: {ex.Message}");
                            }
                        }
                        else
                        {
                             Console.WriteLine($"Warning: User not found for Order ID {order.Id}. Cannot send confirmation email.");
                        }
                        */
                        Console.WriteLine("Email sending is currently commented out."); // Placeholder message
                        // --- End Email Sending comment block ---

                        Console.WriteLine($"Order {internalOrderId} fulfillment complete (excluding email).");
                    }
                    else
                    {
                        Console.WriteLine($"Webhook Info: Order {internalOrderId} already processed (status: {order.Status}). Acknowledging event.");
                    }
                }
                else
                {
                     Console.WriteLine($"Payment status is {session?.PaymentStatus} for order {internalOrderId}. Order not fulfilled.");
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
                // Placeholder/Warning for PaymentIntent failure handling needing more robust linking
                var checkoutSessionId = paymentIntent?.LatestCharge?.PaymentIntent?.Id;
                 Console.WriteLine($"Attempting to handle failure based on PaymentIntent {paymentIntent?.Id}. Checkout Session ID linked: {checkoutSessionId}");
                 Console.WriteLine($"Warning: Direct order update from payment_intent.failed not fully implemented without order/PI linkage.");
            }
            // --- End Handle Payment Failure Events ---
            else
            {
                Console.WriteLine($"Unhandled event type: {stripeEvent.Type}");
            }

            return Ok();
        }
        catch (StripeException e)
        {
            Console.WriteLine($"Stripe Webhook Error: {e.Message}");
            return BadRequest();
        }
         catch (Exception e)
        {
            Console.WriteLine($"Webhook General Error: {e.Message}\n{e.StackTrace}");
            return StatusCode(500, "Internal server error");
        }
    }

    // --- Helper method to handle failed payments ---
    private async Task HandleFailedPayment(string? sessionId, Dictionary<string, string>? metadata, string failureReason)
    {
        Console.WriteLine($"Handling failed payment. Session ID: {sessionId}, Reason: {failureReason}");
        if (metadata != null && metadata.TryGetValue("internalOrderId", out var orderIdStr) && int.TryParse(orderIdStr, out var internalOrderId))
        {
             var order = await _context.Orders.FindAsync(internalOrderId);
             if (order != null)
             {
                 if (order.Status == "Pending")
                 {
                     order.Status = "Failed";
                     order.Notes = $"Payment failed: {failureReason}"; // Use Notes property added earlier
                     await _context.SaveChangesAsync();
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

// Request model for creating a checkout session
public class CheckoutSessionRequest
{
    public required List<CheckoutItem> Items { get; set; }
    public int StoreId { get; set; }
    public required string StoreUrl { get; set; }
}

// Represents a single item in the checkout request
public class CheckoutItem
{
    public int Id { get; set; } // Represents the BasicItem.ListId (product primary key)
    public required string Name { get; set; }
    public decimal Price { get; set; }
    public int Quantity { get; set; }
}

