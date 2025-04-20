using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Stripe;
using System.Threading.Tasks;
using System.Collections.Generic; // Added for List<string>
using System; // Added for Exception
using System.Linq; // Added for Select
// Add necessary using statements for your User model, DbContext, and user service/authentication
using Server.Data; 
using Server.Models;
using Microsoft.AspNetCore.Identity; // Or your authentication mechanism
using Microsoft.EntityFrameworkCore; // For FindAsync, SaveChangesAsync
using System.Security.Claims; // For User.FindFirstValue
using Microsoft.AspNetCore.Authorization; // For [Authorize]

[ApiController]
[Route("api/[controller]")]
[Authorize] // Secure this controller
public class UserPaymentController : ControllerBase
{
    private readonly IConfiguration _configuration;
    // Inject your DbContext and UserManager
    private readonly AppDbContext _context;
    private readonly UserManager<User> _userManager;

    public UserPaymentController(
        IConfiguration configuration,
        AppDbContext context, 
        UserManager<User> userManager
    )
    {
        _configuration = configuration;
        _context = context;
        _userManager = userManager;

        // Set the Stripe API key globally (consider doing this in Startup.cs)
        StripeConfiguration.ApiKey = _configuration["Stripe:SecretKey"];
    }

    [HttpPost("create-setup-intent")]
    public async Task<ActionResult> CreateSetupIntent()
    {
        // --- 1. Get User and Stripe Customer ID ---
        var userId = GetCurrentUserId(); // Use helper method
        if (userId == null)
        {
            return Unauthorized("Could not identify user.");
        }

        var user = await FindUserByIdAsync(userId.Value); // Use helper method
        if (user == null)
        {
            return NotFound("User not found.");
        }

        string? stripeCustomerId = user.StripeCustomerId; 

        // --- 2. Ensure Stripe Customer Exists ---
        if (string.IsNullOrEmpty(stripeCustomerId))
        {
            // Create a new Stripe Customer
            var customerOptions = new CustomerCreateOptions
            {
                Email = user.Email, 
                Name = $"{user.FirstName} {user.LastName}", 
                Metadata = new Dictionary<string, string> { { "AppUserId", user.Id.ToString() } }
            };
            var customerService = new CustomerService();
            Customer stripeCustomer = await customerService.CreateAsync(customerOptions);
            stripeCustomerId = stripeCustomer.Id;

            // Save the new Stripe Customer ID to your user record
            user.StripeCustomerId = stripeCustomerId;
            await SaveUserChangesAsync(user); // Use helper method
        }

        // --- 3. Create SetupIntent ---
        var setupIntentOptions = new SetupIntentCreateOptions
        {
            Customer = stripeCustomerId,
            Usage = "on_session",
            PaymentMethodTypes = new List<string> { "card" },
        };
        var setupIntentService = new SetupIntentService();
        SetupIntent setupIntent = await setupIntentService.CreateAsync(setupIntentOptions);

        // --- 4. Return Client Secret ---
        return Ok(new { clientSecret = setupIntent.ClientSecret });
    }

    // Define a model for the request body
    public class SavePaymentMethodRequest
    {
        // Initialize to default to satisfy CS8618
        public string PaymentMethodId { get; set; } = default!;
        public bool IsDefault { get; set; }
    }

    [HttpPost("save-method")]
    public async Task<ActionResult> SavePaymentMethod([FromBody] SavePaymentMethodRequest request)
    {
        if (string.IsNullOrEmpty(request?.PaymentMethodId))
        {
            return BadRequest("PaymentMethodId is required.");
        }

        // --- 1. Get User and Stripe Customer ID ---
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();
        
        var user = await FindUserByIdAsync(userId.Value);
        if (user?.StripeCustomerId == null)
        {
            return NotFound("User or Stripe customer association not found.");
        }
        string stripeCustomerId = user.StripeCustomerId;

        try
        {
            // --- 2. Attach Payment Method to Customer ---
            var service = new PaymentMethodService();
            var attachOptions = new PaymentMethodAttachOptions { Customer = stripeCustomerId };
            PaymentMethod paymentMethod = await service.AttachAsync(request.PaymentMethodId, attachOptions);

            // --- 3. Set as Default if requested ---
            if (request.IsDefault)
            {
                var customerService = new CustomerService();
                var customerUpdateOptions = new CustomerUpdateOptions
                {
                    InvoiceSettings = new CustomerInvoiceSettingsOptions { DefaultPaymentMethod = paymentMethod.Id }
                };
                await customerService.UpdateAsync(stripeCustomerId, customerUpdateOptions);
            }
            return Ok(new { success = true });
        }
        catch (StripeException ex) { /* ... existing error handling ... */ 
            Console.WriteLine($"Stripe Error saving payment method: {ex.StripeError?.Message ?? ex.Message}");
            return BadRequest(new { error = ex.StripeError?.Message ?? "Failed to save payment method." });
        }
        catch (Exception ex) { /* ... existing error handling ... */ 
            Console.WriteLine($"Error saving payment method: {ex.Message}");
            return StatusCode(500, "An internal error occurred.");
        }
    }

    [HttpGet("methods")]
    public async Task<ActionResult> GetPaymentMethods(/* int userIdRouteParam */) // <-- Remove parameter
    {
        // --- 1. Get Authenticated User and Validate Access ---
        var requestingUserId = GetCurrentUserId();
        if (requestingUserId == null) return Unauthorized();

        // **** Authorization Check: No longer needed as we use the authenticated user directly ****
        // if (requestingUserId.Value != userIdRouteParam)
        // {
        //     return Forbid("You are not authorized to view these payment methods.");
        // }

        var user = await FindUserByIdAsync(requestingUserId.Value); // Use authenticated user's ID
        if (user?.StripeCustomerId == null)
        {
            // Return empty list immediately if no Stripe customer ID
            return Ok(new List<object>()); 
        }
        string stripeCustomerId = user.StripeCustomerId;

        try
        {
            // --- 2. Get Default Payment Method ID from Customer ---
            var customerService = new CustomerService();
            Customer stripeCustomer = await customerService.GetAsync(stripeCustomerId, new CustomerGetOptions{ Expand = new List<string> { "invoice_settings.default_payment_method" }});
            string? defaultPaymentMethodId = stripeCustomer.InvoiceSettings?.DefaultPaymentMethodId;

            // --- 3. List Card Payment Methods ---
            var service = new PaymentMethodService();
            var listOptions = new PaymentMethodListOptions { Customer = stripeCustomerId, Type = "card" };
            StripeList<PaymentMethod> paymentMethods = await service.ListAsync(listOptions);

            // --- 4. Format Response ---
            var results = paymentMethods.Data.Select(pm => new {
                 id = pm.Id, 
                cardType = pm.Card.Brand,
                lastFourDigits = pm.Card.Last4,
                expiryMonth = pm.Card.ExpMonth.ToString("00"),
                expiryYear = pm.Card.ExpYear.ToString(),
                isDefault = pm.Id == defaultPaymentMethodId
            }).ToList();

            return Ok(results);
        }
        catch (StripeException ex) { /* ... existing error handling ... */ 
            Console.WriteLine($"Stripe Error listing payment methods: {ex.StripeError?.Message ?? ex.Message}");
            return BadRequest(new { error = ex.StripeError?.Message ?? "Failed to retrieve payment methods." });
        }
        catch (Exception ex) { /* ... existing error handling ... */ 
            Console.WriteLine($"Error listing payment methods: {ex.Message}");
            return StatusCode(500, "An internal error occurred.");
        }
    }

    [HttpDelete("methods/{paymentMethodId}")]
    public async Task<ActionResult> DeletePaymentMethod(string paymentMethodId)
    {
        if (string.IsNullOrEmpty(paymentMethodId) || !paymentMethodId.StartsWith("pm_"))
        {
            return BadRequest("Invalid PaymentMethodId format.");
        }

        // --- Get Authenticated User --- 
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();
        
        // Optional TODO: More robust validation: retrieve the PM from Stripe
        // and check if its customer ID matches the logged-in user's StripeCustomerId.
        // This prevents users from attempting to detach PMs they don't own,
        // although Stripe's API might handle this implicitly.

        try
        {
            var service = new PaymentMethodService();
            PaymentMethod detachedPaymentMethod = await service.DetachAsync(paymentMethodId);

             var user = await FindUserByIdAsync(userId.Value); // Need user for default check
             if (user?.StripeCustomerId != null)
             {
                 var customerService = new CustomerService();
                 var stripeCustomer = await customerService.GetAsync(user.StripeCustomerId);
                 if (stripeCustomer.InvoiceSettings?.DefaultPaymentMethodId == paymentMethodId)
                 {
                     var customerUpdateOptions = new CustomerUpdateOptions
                     {
                         InvoiceSettings = new CustomerInvoiceSettingsOptions { DefaultPaymentMethod = "" }
                     };
                     await customerService.UpdateAsync(user.StripeCustomerId, customerUpdateOptions);
                 }
             }
            return Ok(new { success = true });
        }
        catch (StripeException ex) { /* ... existing error handling ... */ 
             if (ex.StripeError?.Code == "resource_missing")
             {
                 Console.WriteLine($"Payment method {paymentMethodId} not found or already detached.");
                 return Ok(new { success = true, message = "Payment method not found or already removed." });
             }
            Console.WriteLine($"Stripe Error detaching payment method: {ex.StripeError?.Message ?? ex.Message}");
            return BadRequest(new { error = ex.StripeError?.Message ?? "Failed to delete payment method." });
        }
        catch (Exception ex) { /* ... existing error handling ... */ 
            Console.WriteLine($"Error detaching payment method: {ex.Message}");
            return StatusCode(500, "An internal error occurred.");
        }
    }

    // Model for the Set Default request body
    public class SetDefaultPaymentMethodRequest
    {
        public int UserId { get; set; } // Keep for frontend compatibility, but ignore in favor of authenticated user
        // Initialize to default to satisfy CS8618
        public string PaymentMethodId { get; set; } = default!;
    }


    [HttpPut("default")]
    public async Task<ActionResult> SetDefaultPaymentMethod([FromBody] SetDefaultPaymentMethodRequest request)
    {
        if (string.IsNullOrEmpty(request?.PaymentMethodId) || !request.PaymentMethodId.StartsWith("pm_"))
        {
            return BadRequest("Invalid PaymentMethodId format.");
        }

        // --- Get Authenticated User and Validate --- 
        var requestingUserId = GetCurrentUserId();
        if (requestingUserId == null) return Unauthorized();

        // **** Authorization Check: Ignore request.UserId, use authenticated user ****
        var user = await FindUserByIdAsync(requestingUserId.Value); 
        if (user?.StripeCustomerId == null)
        {
            return NotFound("User or Stripe customer association not found.");
        }
        string stripeCustomerId = user.StripeCustomerId;
        
        // Optional TODO: More robust validation: retrieve the PM from Stripe
        // and check if its customer ID matches stripeCustomerId before setting default.

        try
        {
            var customerService = new CustomerService();
            var customerUpdateOptions = new CustomerUpdateOptions
            {
                InvoiceSettings = new CustomerInvoiceSettingsOptions { DefaultPaymentMethod = request.PaymentMethodId }
            };
            await customerService.UpdateAsync(stripeCustomerId, customerUpdateOptions);
            return Ok(new { success = true });
        }
        catch (StripeException ex) { /* ... existing error handling ... */ 
             if (ex.StripeError?.Code == "resource_missing")
             {
                 return BadRequest(new { error = "Payment method not found or not attached to this customer." });
             }
            Console.WriteLine($"Stripe Error setting default payment method: {ex.StripeError?.Message ?? ex.Message}");
            return BadRequest(new { error = ex.StripeError?.Message ?? "Failed to set default payment method." });
        }
        catch (Exception ex) { /* ... existing error handling ... */ 
            Console.WriteLine($"Error setting default payment method: {ex.Message}");
            return StatusCode(500, "An internal error occurred.");
        }
    }

    // --- Helper Methods (Implement with your actual logic) ---
    private int? GetCurrentUserId()
    {
        // Example using ASP.NET Core Identity ClaimsPrincipal
        var userIdString = _userManager.GetUserId(User); // Or User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (int.TryParse(userIdString, out int userId))
        {
            return userId;
        }
        // Log error or handle case where user ID is not found or not an integer
        Console.WriteLine("Could not parse User ID from claims.");
        return null; 
    }

    private async Task<User?> FindUserByIdAsync(int userId) 
    {
        // Example using DbContext
        // Ensure your User model has the StripeCustomerId property
        return await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
    }

    private async Task SaveUserChangesAsync(User user) 
    {
        // Example using DbContext
         _context.Users.Update(user); // Or Add if it's a new user context
        await _context.SaveChangesAsync();
    }
}

// Remove the placeholder namespace and User class if your actual models are imported correctly
// namespace YourApp.Models 
// {
//     public class User { ... }
// } 