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

