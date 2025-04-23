using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Server.Data;
using Server.Models;
using Shopimy.Server.Models;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Linq; // Add this for LINQ operations on claims
// Add for Execution Strategy
using Microsoft.EntityFrameworkCore.Storage;


namespace Server.Controllers
{
/* 
    public class StoreResponse
    {
        public StoreDetails Store { get; set; }
        public List<Category> Categories { get; set; }
    } */

    [Route("api/[controller]")]
    [ApiController]
    public class StoreController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public StoreController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpGet("{url}")]
        [AllowAnonymous]
        public async Task<ActionResult<StoreDetails>> GetStoreDetails(string url)
        {
            // 🔹 Get store details from Stores or StoreWithTheme view
            var store = await _context.Stores
                .Where(s => s.StoreUrl == url)
                .FirstOrDefaultAsync();

            if (store == null)
            {
                return NotFound("Store not found.");
            }

            var themes = await _context.StoreThemes
                .Where(s => s.StoreId == store.StoreId)
                .FirstOrDefaultAsync();

            // Don't return NotFound if themes are missing, use defaults later
            /* if (themes == null)
            {
                return NotFound("Themes not found.");
            } */

            var banner = await _context.StoreBanners
                .Where(s => s.StoreID == store.StoreId)
                .FirstOrDefaultAsync();

            // Don't return NotFound if banner is missing, use defaults later
            /* if (banner == null)
            {
                return NotFound("Banner not found.");
            } */
            
            var logo = await _context.StoreLogos
                .Where(s => s.StoreID == store.StoreId)
                .FirstOrDefaultAsync();

            // Don't return NotFound if logo is missing, use defaults later
            /* if (logo == null)
            {
                return NotFound("Logo not found.");
            } */
        

            // 🔹 Fetch categories linked to this store
            var categories = await _context.Categories
                .Where(c => c.StoreId == store.StoreId)
                .ToListAsync();
            
            // Construct StoreDetails, using defaults for missing optional data
            StoreDetails storeDetails = new StoreDetails(
                store.StoreId,
                store.StoreUrl,
                store.Name,
                themes?.Theme_1 ?? "#393727", // Default Theme 1
                themes?.Theme_2 ?? "#D0933D", // Default Theme 2
                themes?.Theme_3 ?? "#D3CEBB", // Default Theme 3
                themes?.FontColor ?? "#FFFFFF", // Default Font Color
                themes?.FontFamily ?? "sans-serif", // Default Font Family
                themes?.BannerText ?? "", // Default Banner Text
                themes?.LogoText ?? store.Name, // Default Logo Text (use store name)
                banner?.BannerURL ?? "", // Default Banner URL
                logo?.LogoURL ?? "", // Default Logo URL
                categories, // Categories can be empty list if none
                themes?.ComponentVisibility ?? "{}" // Default Component Visibility (empty JSON)
            );

            // Log this visit asynchronously
            try
            {
                int? userId = null;
                // Check if the user is authenticated
                if (User?.Identity?.IsAuthenticated == true)
                {
                    // Try to get the user ID from the claims
                    var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
                    if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int parsedUserId))
                    {
                        userId = parsedUserId;
                    }
                }

                // Create the visit record
                var storeVisit = new StoreVisit
                {
                    StoreId = store.StoreId,
                    UserId = userId,
                    VisitTimestamp = DateTime.UtcNow
                };

                // Add and save asynchronously
                _context.StoreVisits.Add(storeVisit);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                // Log the error but don't fail the main request
                Console.WriteLine($"Error logging store visit: {ex.Message}");
            }

            // ✅ Return both store details and categories
            return Ok(storeDetails);
        }

        // Get store details for the current logged-in user
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<StoreDetails>> GetCurrentUserStore()
        {
            // Get the user ID from the token - look for numeric claim
            int userId = 0;
            if (User == null)
            {
                Console.WriteLine("ERROR: User is null");
                return Unauthorized("Invalid user authentication token.");
            }
            var nameIdentifierClaims = User.Claims.Where(c => c.Type == ClaimTypes.NameIdentifier).ToList();
            
            // Try to find the claim with numeric value (user ID)
            foreach (var claim in nameIdentifierClaims)
            {
                if (int.TryParse(claim.Value, out int parsedId) && parsedId > 0)
                {
                    userId = parsedId;
                    break;
                }
            }
            
            if (userId == 0)
            {
                Console.WriteLine("ERROR (GetCurrentUserStore): Failed to find a valid numeric User ID from claims.");
                // Dump claims for debugging if user ID not found
                Console.WriteLine("--- Dumping Claims in GetCurrentUserStore ---");
                foreach (var claim in User.Claims) { Console.WriteLine($"Claim Type: {claim.Type}, Claim Value: {claim.Value}"); }
                Console.WriteLine("--- End Claim Dump ---");
                return Unauthorized("Invalid user authentication token.");
            }

            // Find store for this user
            var store = await _context.Stores
                .Where(s => s.StoreOwnerId == userId)
                .FirstOrDefaultAsync();

            if (store == null)
            {
                // No store found, return empty response that can be used for initial setup
                // Return an empty StoreDetails object or similar structure expected by the frontend
                // Avoid returning NotFound if the intention is to allow creation flow
                return Ok(new StoreDetails { Categories = new List<Category>() }); // Return empty details
            }

            // Get other store details
            var themes = await _context.StoreThemes
                .Where(s => s.StoreId == store.StoreId)
                .FirstOrDefaultAsync();

            var banner = await _context.StoreBanners
                .Where(s => s.StoreID == store.StoreId)
                .FirstOrDefaultAsync();
            
            var logo = await _context.StoreLogos
                .Where(s => s.StoreID == store.StoreId)
                .FirstOrDefaultAsync();

            // Fetch categories linked to this store
            var categories = await _context.Categories
                .Where(c => c.StoreId == store.StoreId)
                .ToListAsync();
            
            // Use actual URL/name rather than defaults if they exist
            string storeName = string.IsNullOrEmpty(store.Name) ? "My Store" : store.Name;
            string storeUrl = string.IsNullOrEmpty(store.StoreUrl) ? "my-store" : store.StoreUrl;
            
            StoreDetails storeDetails = new StoreDetails(
                store.StoreId,
                storeUrl,
                storeName,
                themes?.Theme_1 ?? "#393727",
                themes?.Theme_2 ?? "#D0933D",
                themes?.Theme_3 ?? "#D3CEBB",
                themes?.FontColor ?? "#FFFFFF",
                themes?.FontFamily ?? "sans-serif",
                themes?.BannerText ?? "Welcome to our store",
                themes?.LogoText ?? storeName,
                banner?.BannerURL ?? "",
                logo?.LogoURL ?? "",
                categories,
                themes?.ComponentVisibility ?? "{}" // Ensure ComponentVisibility is included
            );

            return Ok(storeDetails);
        }

        // Create a new store
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<StoreDetails>> CreateStore([FromBody] StoreDetails storeDetails)
        {
            // === DETAILED CLAIM LOGGING START ===
            Console.WriteLine("--- Dumping Claims in CreateStore ---");
            if (User?.Identity?.IsAuthenticated == true)
            {
                foreach (var claim in User.Claims)
                {
                    Console.WriteLine($"Claim Type: {claim.Type}, Claim Value: {claim.Value}");
                }
            }
            else
            {
                Console.WriteLine("User is not authenticated or ClaimsPrincipal is null.");
                return Unauthorized("User is not authenticated."); // Return early if not authenticated
            }
            Console.WriteLine("--- End Claim Dump ---");
            // === DETAILED CLAIM LOGGING END ===

            // Get the user ID from the token - look for numeric claim
            int userId = 0;
            if (User == null) // Should be redundant due to Authorize and previous check, but safe
            {
                Console.WriteLine("ERROR: User is null in CreateStore after authentication check.");
                return Unauthorized("Invalid user authentication token.");
            }
            var nameIdentifierClaims = User.Claims.Where(c => c.Type == ClaimTypes.NameIdentifier).ToList();

            // Try to find the claim with numeric value (user ID)
            foreach (var claim in nameIdentifierClaims)
            {
                if (int.TryParse(claim.Value, out int parsedId) && parsedId > 0)
                {
                    userId = parsedId;
                    break;
                }
            }

            if (userId == 0)
            {
                Console.WriteLine("ERROR (CreateStore): Failed to find a valid numeric User ID from claims.");
                // Consider logging the email claim here if found, to debug the "email not found" log
                var emailClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
                Console.WriteLine($"Email claim found: {emailClaim ?? "Not Found"}");
                return Unauthorized("Invalid user authentication token (Could not parse User ID).");
            }

            // Basic input validation
            if (storeDetails == null || string.IsNullOrWhiteSpace(storeDetails.Name))
            {
                return BadRequest("Store details are invalid or missing required fields (Name).");
            }

            // Use Execution Strategy for the database operations
            var strategy = _context.Database.CreateExecutionStrategy();
            ActionResult<StoreDetails> result = await strategy.ExecuteAsync(async () =>
            {
                using (var transaction = await _context.Database.BeginTransactionAsync())
                {
                    try
                    {
                        // 🔹 Check if user already owns a store
                        var existingStore = await _context.Stores.FirstOrDefaultAsync(s => s.StoreOwnerId == userId);
                        if (existingStore != null)
                        {
                            // No need to explicitly rollback, transaction using block handles it
                            return Conflict("User already owns a store.");
                        }

                        // 🔹 Generate and check store URL
                        string storeUrl = storeDetails.URL; // Use URL property from StoreDetails
                        if (string.IsNullOrEmpty(storeUrl))
                        {
                            storeUrl = GenerateUniqueStoreUrl(storeDetails.Name); // Ensure this is reasonably unique
                        }
                        else
                        {
                            storeUrl = storeUrl.ToLower().Replace(" ", "-").Trim();
                            // Add more robust slug generation/validation if needed
                            if (string.IsNullOrWhiteSpace(storeUrl))
                            {
                                storeUrl = GenerateUniqueStoreUrl(storeDetails.Name);
                            }
                        }

                        var storeWithSameUrl = await _context.Stores.FirstOrDefaultAsync(s => s.StoreUrl == storeUrl);
                        if (storeWithSameUrl != null)
                        {
                            return Conflict($"Store URL '{storeUrl}' is already taken.");
                        }

                        // 🔹 Check if store Name is taken (Optional, adjust if names don't need to be unique)
                        var storeWithSameName = await _context.Stores.AnyAsync(s => s.Name == storeDetails.Name);
                        if (storeWithSameName)
                        {
                            // Allowing same name for now, comment out or adjust if uniqueness required
                            // return Conflict($"Store name '{storeDetails.Name}' is already taken.");
                            Console.WriteLine($"Warning: Store name '{storeDetails.Name}' is already taken, but allowed.");
                        }

                        // ✅ Create the store
                        var store = new Store
                        {
                            StoreOwnerId = userId,
                            Name = storeDetails.Name.Trim(), // Trim whitespace
                            StoreUrl = storeUrl
                        };
                        _context.Stores.Add(store);
                        // Save store to get its ID for related entities
                        await _context.SaveChangesAsync();

                        // ✅ Create default theme settings
                        var theme = new StoreTheme
                        {
                            StoreId = store.StoreId,
                            Theme_1 = storeDetails.Theme_1 ?? "#393727",
                            Theme_2 = storeDetails.Theme_2 ?? "#D0933D",
                            Theme_3 = storeDetails.Theme_3 ?? "#D3CEBB",
                            FontColor = storeDetails.FontColor ?? "#FFFFFF",
                            FontFamily = storeDetails.FontFamily ?? "sans-serif",
                            BannerText = storeDetails.BannerText ?? "Welcome",
                            LogoText = storeDetails.LogoText ?? store.Name, // Use created store name
                            ComponentVisibility = storeDetails.ComponentVisibility ?? "{}"
                        };
                        _context.StoreThemes.Add(theme);

                        // ✅ Create default banner
                        var banner = new StoreBanner
                        {
                            StoreID = store.StoreId,
                            BannerURL = storeDetails.BannerURL ?? "" // Use provided or empty
                        };
                        _context.StoreBanners.Add(banner);

                        // ✅ Create default logo
                        var logo = new StoreLogo
                        {
                            StoreID = store.StoreId,
                            LogoURL = storeDetails.LogoURL ?? "" // Use provided or empty
                        };
                        _context.StoreLogos.Add(logo);

                        // ✅ Handle Categories
                        List<Category> createdCategories = new List<Category>();
                        if (storeDetails.Categories == null || !storeDetails.Categories.Any())
                        {
                            // Create Category without Description
                            var defaultCategory = new Category { StoreId = store.StoreId, Name = "General" };
                            _context.Categories.Add(defaultCategory);
                            createdCategories.Add(defaultCategory);
                        }
                        else
                        {
                            foreach (var categoryInput in storeDetails.Categories)
                            {
                                if (!string.IsNullOrWhiteSpace(categoryInput.Name)) // Basic validation
                                {
                                    // Create Category without Description
                                    var newCategory = new Category
                                    {
                                        StoreId = store.StoreId,
                                        Name = categoryInput.Name.Trim()
                                        // Description = categoryInput.Description?.Trim() ?? "" // Removed Description
                                    };
                                    _context.Categories.Add(newCategory);
                                    createdCategories.Add(newCategory);
                                }
                            }
                            if (!createdCategories.Any()) // Add default if input was invalid/empty
                            {
                                // Create Category without Description
                                var defaultCategory = new Category { StoreId = store.StoreId, Name = "General" };
                                _context.Categories.Add(defaultCategory);
                                createdCategories.Add(defaultCategory);
                            }
                        }

                        // Save all changes within the transaction
                        await _context.SaveChangesAsync();

                        // Commit the transaction
                        await transaction.CommitAsync();

                        // Prepare response DTO using the created entities
                        // Use Id and URL properties for StoreDetails
                        storeDetails.Id = store.StoreId;
                        storeDetails.URL = store.StoreUrl; // Ensure the final URL is returned
                        storeDetails.Name = store.Name;
                        storeDetails.Categories = createdCategories; // Return the actual created categories

                        // Return CreatedAtAction or Ok with the created store details
                        // If GetStoreDetails takes url: return CreatedAtAction(nameof(GetStoreDetails), new { url = store.StoreUrl }, storeDetails);
                        // Returning OK for now
                        return Ok(storeDetails);
                    }
                    catch (DbUpdateException dbEx) // Catch specific EF Core update exceptions
                    {
                        Console.WriteLine($"Database update error during store creation: {dbEx.ToString()}");
                        // Log inner exception if available
                        if (dbEx.InnerException != null)
                        {
                            Console.WriteLine($"Inner Exception: {dbEx.InnerException.ToString()}");
                        }
                        // Transaction will be rolled back automatically
                        return new ObjectResult($"An error occurred while saving store data. {dbEx.Message}") { StatusCode = 500 };
                    }
                    catch (Exception ex)
                    {
                        // Log the general exception details
                        Console.WriteLine($"Error creating store: {ex.ToString()}");
                        // Transaction will be rolled back automatically
                        return new ObjectResult("An unexpected error occurred while creating the store.") { StatusCode = 500 };
                    }
                } // using transaction disposes it (and rolls back if not committed)
            }); // End Execution Strategy block

            return result; // Return the result from the execution strategy
        }

        private string GenerateUniqueStoreUrl(string name)
        {
            // Simple slug generation - replace spaces, lowercase, remove invalid chars
            string baseSlug = System.Text.RegularExpressions.Regex.Replace(name.ToLower(), @"\s+", "-");
            baseSlug = System.Text.RegularExpressions.Regex.Replace(baseSlug, @"[^a-z0-9\-]", "");
            baseSlug = baseSlug.Trim('-');

            if (string.IsNullOrWhiteSpace(baseSlug))
            {
                baseSlug = "my-store"; // Fallback
            }

            // Append timestamp or random string for uniqueness - simple approach
            // A robust solution might check DB iteratively, but this is often sufficient
            string uniqueSlug = $"{baseSlug}-{DateTime.UtcNow.Ticks % 10000}"; // Simple uniqueness

            // Basic check if this simple version exists (though unlikely)
            // Note: This check happens *outside* the transaction currently.
            // If high collision expected, move uniqueness generation/check inside the transaction.
            /*
            var existing = _context.Stores.Any(s => s.StoreUrl == uniqueSlug);
            if (existing) {
                // Handle collision - e.g., add more random chars or retry generation
                uniqueSlug = $"{baseSlug}-{Guid.NewGuid().ToString().Substring(0, 6)}";
            }
            */
            return uniqueSlug;
        }

        // Update store configuration
        [HttpPut("update")]
        [Authorize]
        public async Task<ActionResult<StoreDetails>> UpdateStore([FromBody] StoreDetails storeDetails)
        {
            // === CLAIM LOGGING START ===
            Console.WriteLine("--- Dumping Claims in UpdateStore ---");
            if (User?.Identity?.IsAuthenticated == true) { foreach (var claim in User.Claims) { Console.WriteLine($"Claim Type: {claim.Type}, Claim Value: {claim.Value}"); } } else { Console.WriteLine("User is not authenticated."); return Unauthorized(); }
            Console.WriteLine("--- End Claim Dump ---");
            // === CLAIM LOGGING END ===

            // Get User ID
            int userId = 0;
            var nameIdentifierClaims = User.Claims.Where(c => c.Type == ClaimTypes.NameIdentifier).ToList();
            foreach (var claim in nameIdentifierClaims) { if (int.TryParse(claim.Value, out int parsedId) && parsedId > 0) { userId = parsedId; break; } }
            if (userId == 0) { Console.WriteLine("ERROR (UpdateStore): Failed to find valid numeric User ID."); return Unauthorized("Invalid token."); }

            // Validate Input - Use Id property
            if (storeDetails == null || storeDetails.Id <= 0)
            {
                return BadRequest("Invalid store data provided.");
            }

            // Use Execution Strategy
            var strategy = _context.Database.CreateExecutionStrategy();
            ActionResult<StoreDetails> result = await strategy.ExecuteAsync(async () =>
            {
                using (var transaction = await _context.Database.BeginTransactionAsync())
                {
                    try
                    {
                        // Verify store exists and belongs to the user - Use Id property
                        var store = await _context.Stores
                            .FirstOrDefaultAsync(s => s.StoreId == storeDetails.Id && s.StoreOwnerId == userId);

                        if (store == null)
                        {
                            return NotFound("Store not found or you do not have permission to update it.");
                        }

                        // Update Store details
                        if (!string.IsNullOrWhiteSpace(storeDetails.Name))
                        {
                            // Check if name changed and if new name is taken (optional, depends on rules)
                            /* if (store.Name != storeDetails.Name.Trim()) {
                                var nameExists = await _context.Stores.AnyAsync(s => s.Name == storeDetails.Name.Trim() && s.StoreId != store.StoreId);
                                if (nameExists) { return Conflict($"Store name '{storeDetails.Name.Trim()}' is already in use."); }
                                store.Name = storeDetails.Name.Trim();
                            } */
                            store.Name = storeDetails.Name.Trim(); // Allowing duplicate names for now
                        }
                        // Note: Usually, Store URL should not be easily updatable after creation due to SEO/linking.
                        // If URL update is allowed, need careful checks for uniqueness and potential redirects.
                        // Skipping URL update here. store.StoreUrl = storeDetails.URL;

                        // Update Theme settings
                        var theme = await _context.StoreThemes.FirstOrDefaultAsync(t => t.StoreId == store.StoreId);
                        if (theme == null)
                        {
                            // Theme settings don't exist, create them
                            theme = new StoreTheme { StoreId = store.StoreId };
                            _context.StoreThemes.Add(theme);
                        }
                        theme.Theme_1 = storeDetails.Theme_1 ?? theme.Theme_1; // Keep existing if null
                        theme.Theme_2 = storeDetails.Theme_2 ?? theme.Theme_2;
                        theme.Theme_3 = storeDetails.Theme_3 ?? theme.Theme_3;
                        theme.FontColor = storeDetails.FontColor ?? theme.FontColor;
                        theme.FontFamily = storeDetails.FontFamily ?? theme.FontFamily;
                        theme.BannerText = storeDetails.BannerText ?? theme.BannerText; // Allow empty string
                        theme.LogoText = storeDetails.LogoText ?? theme.LogoText; // Allow empty string
                        theme.ComponentVisibility = storeDetails.ComponentVisibility ?? theme.ComponentVisibility;

                        // Update Banner settings
                        var banner = await _context.StoreBanners.FirstOrDefaultAsync(b => b.StoreID == store.StoreId);
                        if (banner == null) {
                            banner = new StoreBanner { StoreID = store.StoreId };
                            _context.StoreBanners.Add(banner);
                        }
                        // Only update URL if provided in the request, otherwise keep existing
                        if (storeDetails.BannerURL != null) // Check for null, allow empty string to clear it
                        {
                            banner.BannerURL = storeDetails.BannerURL;
                        }

                        // Update Logo settings
                        var logo = await _context.StoreLogos.FirstOrDefaultAsync(l => l.StoreID == store.StoreId);
                        if (logo == null) {
                            logo = new StoreLogo { StoreID = store.StoreId };
                            _context.StoreLogos.Add(logo);
                        }
                        // Only update URL if provided in the request
                        if (storeDetails.LogoURL != null) // Check for null, allow empty string to clear it
                        {
                            logo.LogoURL = storeDetails.LogoURL;
                        }

                        // Update Categories (More complex: requires handling additions, deletions, updates)
                        // Simple approach: Replace existing categories with provided ones
                        // WARNING: This deletes existing categories not present in the request.
                        // A better approach might involve tracking changes or specific add/delete endpoints.
                        if (storeDetails.Categories != null)
                        {
                            var existingCategories = await _context.Categories.Where(c => c.StoreId == store.StoreId).ToListAsync();
                            _context.Categories.RemoveRange(existingCategories); // Remove old ones

                            List<Category> updatedCategories = new List<Category>();
                            foreach (var catInput in storeDetails.Categories)
                            {
                                if (!string.IsNullOrWhiteSpace(catInput.Name))
                                {
                                    // Create Category without Description
                                    var newCat = new Category
                                    {
                                        StoreId = store.StoreId,
                                        Name = catInput.Name.Trim()
                                        // Description = catInput.Description?.Trim() ?? "" // Removed Description
                                        // Preserve ID if frontend sends it for updates? Requires more logic.
                                    };
                                    _context.Categories.Add(newCat);
                                    updatedCategories.Add(newCat);
                                }
                            }
                            storeDetails.Categories = updatedCategories; // Reflect changes in response DTO
                        } else {
                            // If categories are null in request, maybe fetch existing ones to return?
                            storeDetails.Categories = await _context.Categories.Where(c => c.StoreId == store.StoreId).ToListAsync();
                        }

                        // Save all changes
                        await _context.SaveChangesAsync();
                        await transaction.CommitAsync();

                        // Prepare response DTO
                        // Ensure storeDetails reflects the final state after updates/defaults
                        // Use Id and URL properties
                        storeDetails.Id = store.StoreId;
                        storeDetails.URL = store.StoreUrl; // Return the non-updated URL
                        storeDetails.Name = store.Name;
                        storeDetails.Theme_1 = theme.Theme_1;
                        storeDetails.Theme_2 = theme.Theme_2;
                        storeDetails.Theme_3 = theme.Theme_3;
                        storeDetails.FontColor = theme.FontColor;
                        storeDetails.FontFamily = theme.FontFamily;
                        storeDetails.BannerText = theme.BannerText;
                        storeDetails.LogoText = theme.LogoText;
                        storeDetails.BannerURL = banner.BannerURL;
                        storeDetails.LogoURL = logo.LogoURL;
                        storeDetails.ComponentVisibility = theme.ComponentVisibility;
                        // Categories already updated in DTO if handled

                        return Ok(storeDetails);
                    }
                    catch (DbUpdateConcurrencyException)
                    {
                        // Handle concurrency conflict (e.g., data was modified by another user)
                        // Use Id property for logging
                        Console.WriteLine($"Concurrency error updating store ID {storeDetails.Id}.");
                        await transaction.RollbackAsync(); // Explicit rollback might be needed here before returning
                        return Conflict("Store data has been modified since you loaded it. Please refresh and try again.");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error updating store: {ex.ToString()}");
                        // Transaction rolls back via using block
                        return new ObjectResult("An error occurred while updating the store.") { StatusCode = 500 };
                    }
                }
            });

            return result;
        }

        // Save theme settings
        [HttpPut("theme")]
        [Authorize]
        // ThemeUpdateRequest only contains theme/font colors/family. We need StoreId separately.
        // Consider adding StoreId to ThemeUpdateRequest or passing it as a route parameter.
        // For now, assume StoreId comes from the logged-in user's store.
        // public async Task<ActionResult<StoreDetails>> SaveThemeSettings([FromBody] ThemeUpdateRequest request, int storeId) // Option 1: Route param
        public async Task<ActionResult<StoreDetails>> SaveThemeSettings([FromBody] ThemeUpdateRequest request)
        {
            // Get User ID (ensure helper method or copy logic)
            int userId = 0;
            var nameIdentifierClaims = User.Claims.Where(c => c.Type == ClaimTypes.NameIdentifier).ToList();
            foreach (var claim in nameIdentifierClaims) { if (int.TryParse(claim.Value, out int parsedId) && parsedId > 0) { userId = parsedId; break; } }
            if (userId == 0) { return Unauthorized("Invalid token."); }

            // Validate input - ThemeUpdateRequest doesn't have StoreId
            if (request == null /* || request.StoreId <= 0 */) // Removed StoreId check from request
            {
                // return BadRequest("Invalid theme update request.");
            }

            var strategy = _context.Database.CreateExecutionStrategy();
            ActionResult<StoreDetails> result = await strategy.ExecuteAsync(async () =>
            {
                using (var transaction = await _context.Database.BeginTransactionAsync())
                {
                    try
                    {
                         // Verify store exists and belongs to user - Fetch user's store ID first
                         var userStore = await _context.Stores.FirstOrDefaultAsync(s => s.StoreOwnerId == userId);
                         if (userStore == null)
                         {
                             return NotFound("User does not own a store.");
                         }
                         int storeId = userStore.StoreId; // Get Store ID from the user's store

                         // Fetch the store theme entity using the derived storeId
                         // var store = await _context.Stores.FirstOrDefaultAsync(s => s.StoreId == request.StoreId && s.StoreOwnerId == userId);
                         /* if (store == null)
                         {
                             return NotFound("Store not found or permission denied.");
                         } */

                         // Find or create theme settings
                         var theme = await _context.StoreThemes.FirstOrDefaultAsync(t => t.StoreId == storeId);
                         if (theme == null)
                         {
                             theme = new StoreTheme { StoreId = storeId };
                             _context.StoreThemes.Add(theme);
                         }

                         // Update theme properties from request - BannerText, LogoText, ComponentVisibility are NOT in ThemeUpdateRequest
                         theme.Theme_1 = request.Theme_1 ?? theme.Theme_1;
                         theme.Theme_2 = request.Theme_2 ?? theme.Theme_2;
                         theme.Theme_3 = request.Theme_3 ?? theme.Theme_3;
                         theme.FontColor = request.FontColor ?? theme.FontColor;
                         theme.FontFamily = request.FontFamily ?? theme.FontFamily;
                         // theme.BannerText = request.BannerText ?? theme.BannerText; // Removed
                         // theme.LogoText = request.LogoText ?? theme.LogoText;     // Removed
                         // theme.ComponentVisibility = request.ComponentVisibility ?? theme.ComponentVisibility; // Removed

                         await _context.SaveChangesAsync();
                         await transaction.CommitAsync();

                         // Return updated store details (need to fetch them)
                         var updatedStoreDetails = await GetStoreById(storeId); // Use helper with derived storeId
                         if (updatedStoreDetails == null) {
                             // Should not happen if update succeeded, but handle defensively
                             return NotFound("Failed to retrieve updated store details.");
                         }
                         return Ok(updatedStoreDetails);

                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error saving theme settings: {ex.ToString()}");
                        return new ObjectResult("An error occurred while saving theme settings.") { StatusCode = 500 };
                    }
                }
            });
            return result;
        }

        [HttpGet("check-url/{url}")]
        [AllowAnonymous]
        public async Task<ActionResult<bool>> CheckUrlAvailability(string url)
        {
            if (string.IsNullOrWhiteSpace(url))
            {
                return BadRequest("URL cannot be empty.");
            }
            // Normalize URL before checking
            string normalizedUrl = url.ToLower().Replace(" ", "-").Trim();
            if (string.IsNullOrWhiteSpace(normalizedUrl))
            {
                return Ok(false); // Consider empty/invalid normalized URL as unavailable
            }

            var exists = await _context.Stores.AnyAsync(s => s.StoreUrl == normalizedUrl);
            return Ok(!exists); // Return true if URL is available (does not exist)
        }

        // Helper method to get full StoreDetails by ID (used after updates)
        private async Task<StoreDetails> GetStoreById(int storeId)
        {
            var store = await _context.Stores.FindAsync(storeId);
            if (store == null) return null;

            var themes = await _context.StoreThemes.FirstOrDefaultAsync(t => t.StoreId == storeId);
            var banner = await _context.StoreBanners.FirstOrDefaultAsync(b => b.StoreID == storeId);
            var logo = await _context.StoreLogos.FirstOrDefaultAsync(l => l.StoreID == storeId);
            var categories = await _context.Categories.Where(c => c.StoreId == storeId).ToListAsync();

            return new StoreDetails(
                store.StoreId,
                store.StoreUrl,
                store.Name,
                themes?.Theme_1 ?? "#393727",
                themes?.Theme_2 ?? "#D0933D",
                themes?.Theme_3 ?? "#D3CEBB",
                themes?.FontColor ?? "#FFFFFF",
                themes?.FontFamily ?? "sans-serif",
                themes?.BannerText ?? "",
                themes?.LogoText ?? store.Name,
                banner?.BannerURL ?? "",
                logo?.LogoURL ?? "",
                categories,
                themes?.ComponentVisibility ?? "{}"
            );
        }
    }
}