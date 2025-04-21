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
                themes?.FontColor ?? "#333333", // Default Font Color
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
                return Unauthorized("Invalid user authentication token.");
            }

            // Find store for this user
            var store = await _context.Stores
                .Where(s => s.StoreOwnerId == userId)
                .FirstOrDefaultAsync();

            if (store == null)
            {
                // No store found, return empty response that can be used for initial setup
                return Ok(new StoreDetails());
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
                themes?.FontColor ?? "#333333",
                themes?.FontFamily ?? "sans-serif",
                themes?.BannerText ?? "Welcome to our store",
                themes?.LogoText ?? storeName,
                banner?.BannerURL ?? "",
                logo?.LogoURL ?? "",
                categories,
                themes?.ComponentVisibility ?? ""
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
            }
            Console.WriteLine("--- End Claim Dump ---");
            // === DETAILED CLAIM LOGGING END ===

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
                Console.WriteLine("ERROR: Failed to find a valid numeric User ID from claims.");
                return Unauthorized("Invalid user authentication token.");
            }

            // Get user email from the non-numeric claim with NameIdentifier type
            // or from the Subject claim which should have the email
            string userEmail = "";
            foreach (var claim in nameIdentifierClaims)
            {
                if (!int.TryParse(claim.Value, out _) && claim.Value.Contains('@'))
                {
                    userEmail = claim.Value;
                    break;
                }
            }
            
            // Fallback to using the Sub claim if needed
            if (string.IsNullOrEmpty(userEmail))
            {
                userEmail = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value ?? string.Empty;
            }
            
            if (string.IsNullOrEmpty(userEmail) || !userEmail.Contains('@'))
            {
                Console.WriteLine("ERROR: Failed to find a valid email address in the claims.");
                // We'll continue with a default value since we have the user ID
                userEmail = $"user{userId}@example.com";
            }

            // Extract username from email (part before the @ symbol)
            string username = userEmail.Split('@')[0];

            // Check if user already has a store
            var existingStoreCheck = await _context.Stores
                .AsNoTracking() // Use AsNoTracking for read-only checks
                .Where(s => s.StoreOwnerId == userId)
                .FirstOrDefaultAsync();

            if (existingStoreCheck != null)
            {
                return BadRequest("User already has a store");
            }

            // Check if store URL is unique
            var storeWithSameUrlCheck = await _context.Stores
                .AsNoTracking()
                .Where(s => s.StoreUrl == storeDetails.URL)
                .FirstOrDefaultAsync();

            if (storeWithSameUrlCheck != null)
            {
                return BadRequest("Store URL already exists");
            }

            // Check if store name (username) already exists and find a unique one
            string storeName = username;
            int suffix = 1;
            while (await _context.Stores.AsNoTracking().AnyAsync(s => s.Name == storeName))
            {
                storeName = $"{username}{suffix}";
                suffix++;
            }

            // Start Transaction
            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    // Create new store with the extracted and validated username
                    var store = new Store
                    {
                        StoreOwnerId = userId,
                        Name = storeName,
                        StoreUrl = storeDetails.URL
                    };
                    _context.Stores.Add(store);
                    await _context.SaveChangesAsync(); // Save store to get its ID

                    // Create themes
                    var theme = new StoreTheme
                    {
                        StoreId = store.StoreId,
                        Theme_1 = storeDetails.Theme_1,
                        Theme_2 = storeDetails.Theme_2,
                        Theme_3 = storeDetails.Theme_3,
                        FontColor = storeDetails.FontColor,
                        FontFamily = storeDetails.FontFamily,
                        BannerText = storeDetails.BannerText,
                        LogoText = storeDetails.LogoText ?? storeName, // Default LogoText to store name if not provided
                        ComponentVisibility = storeDetails.ComponentVisibility
                    };
                    _context.StoreThemes.Add(theme);
                    
                    // Create banner
                    var banner = new StoreBanner
                    {
                        StoreID = store.StoreId,
                        BannerURL = storeDetails.BannerURL
                    };
                    _context.StoreBanners.Add(banner);

                    // Create logo
                    var logo = new StoreLogo
                    {
                        StoreID = store.StoreId,
                        LogoURL = storeDetails.LogoURL
                    };
                    _context.StoreLogos.Add(logo);
                    
                    // Save all related entities
                    await _context.SaveChangesAsync();

                    // Commit transaction
                    await transaction.CommitAsync();

                    // Return the created store details with the actual store name used
                    storeDetails.Id = store.StoreId;
                    storeDetails.Name = storeName; // Update the name in the response
                    return CreatedAtAction(nameof(GetStoreDetails), new { url = store.StoreUrl }, storeDetails);
                }
                catch (Exception ex)
                {
                    // Rollback transaction in case of error
                    await transaction.RollbackAsync();
                    Console.WriteLine($"Error creating store: {ex.Message}"); // Log the error
                    return StatusCode(500, "An error occurred while creating the store.");
                }
            }
        }

        // Update store configuration
        [HttpPut("update")]
        [Authorize]
        public async Task<ActionResult<StoreDetails>> UpdateStore([FromBody] StoreDetails storeDetails)
        {
            // Additional validation and logging
            Console.WriteLine($"UpdateStore received: ID={storeDetails.Id}, URL={storeDetails.URL}, Name={storeDetails.Name}");
            
            if (storeDetails.Id <= 0)
            {
                Console.WriteLine("ERROR: Store ID is missing or invalid");
                return BadRequest("Store ID is required");
            }
            
            if (string.IsNullOrEmpty(storeDetails.URL))
            {
                Console.WriteLine("ERROR: Store URL is missing");
                return BadRequest("Store URL is required");
            }
            
            if (string.IsNullOrEmpty(storeDetails.Name))
            {
                Console.WriteLine("ERROR: Store Name is missing");
                return BadRequest("Store Name is required");
            }
            
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
                Console.WriteLine("ERROR (UpdateStore): Failed to find a valid numeric User ID from claims.");
                return Unauthorized("Invalid user authentication token.");
            }

            try 
            {
                // Create an execution strategy
                var strategy = _context.Database.CreateExecutionStrategy();
                StoreDetails? result = null; // Declare as nullable
                
                await strategy.ExecuteAsync(async () =>
                {
                    // All database operations will now be part of the execution strategy
                    using (var transaction = await _context.Database.BeginTransactionAsync())
                    {
                        try
                        {
                            // Check if this is the user's store
                            var store = await _context.Stores
                                .Where(s => s.StoreId == storeDetails.Id)
                                .FirstOrDefaultAsync();

                            if (store == null)
                            {
                                throw new InvalidOperationException("Store not found");
                            }

                            if (store.StoreOwnerId != userId)
                            {
                                throw new UnauthorizedAccessException("You don't have permission to update this store");
                            }

                            // If changing URL, check if it's unique
                            if (store.StoreUrl != storeDetails.URL)
                            {
                                var storeWithSameUrl = await _context.Stores
                                    .AsNoTracking()
                                    .Where(s => s.StoreUrl == storeDetails.URL && s.StoreId != storeDetails.Id)
                                    .FirstOrDefaultAsync();

                                if (storeWithSameUrl != null)
                                {
                                    throw new InvalidOperationException("Store URL already exists");
                                }
                            }

                            // Update store
                            store.Name = storeDetails.Name;
                            store.StoreUrl = storeDetails.URL;
                            _context.Stores.Update(store);

                            // Update themes
                            var theme = await _context.StoreThemes
                                .Where(s => s.StoreId == store.StoreId)
                                .FirstOrDefaultAsync();

                            if (theme == null)
                            {
                                theme = new StoreTheme
                                {
                                    StoreId = store.StoreId
                                };
                                _context.StoreThemes.Add(theme);
                            }

                            theme.Theme_1 = storeDetails.Theme_1;
                            theme.Theme_2 = storeDetails.Theme_2;
                            theme.Theme_3 = storeDetails.Theme_3;
                            theme.FontColor = storeDetails.FontColor;
                            theme.FontFamily = storeDetails.FontFamily;
                            theme.BannerText = storeDetails.BannerText;
                            theme.LogoText = storeDetails.LogoText;
                            theme.ComponentVisibility = storeDetails.ComponentVisibility;

                            // Update banner
                            var banner = await _context.StoreBanners
                                .Where(s => s.StoreID == store.StoreId)
                                .FirstOrDefaultAsync();

                            if (banner == null)
                            {
                                banner = new StoreBanner
                                {
                                    StoreID = store.StoreId
                                };
                                _context.StoreBanners.Add(banner);
                            }

                            banner.BannerURL = storeDetails.BannerURL;

                            // Update logo
                            var logo = await _context.StoreLogos
                                .Where(s => s.StoreID == store.StoreId)
                                .FirstOrDefaultAsync();

                            if (logo == null)
                            {
                                logo = new StoreLogo
                                {
                                    StoreID = store.StoreId
                                };
                                _context.StoreLogos.Add(logo);
                            }

                            logo.LogoURL = storeDetails.LogoURL;

                            // Save changes
                            await _context.SaveChangesAsync();

                            // Commit transaction
                            await transaction.CommitAsync();

                            // Store the result
                            result = storeDetails;
                        }
                        catch (Exception ex)
                        {
                            // Rollback transaction in case of error
                            await transaction.RollbackAsync();
                            Console.WriteLine($"Error in update transaction: {ex.Message}");
                            throw; // Re-throw to be caught by outer catch
                        }
                    }
                });

                // Return the result after execution strategy completes
                return Ok(result);
            }
            catch (Exception ex)
            {
                string errorMessage = ex switch
                {
                    UnauthorizedAccessException _ => ex.Message,
                    InvalidOperationException _ => ex.Message,
                    _ => "An error occurred while updating the store."
                };
                
                Console.WriteLine($"Error updating store: {ex.Message}");
                return StatusCode(500, errorMessage);
            }
        }
    }
}