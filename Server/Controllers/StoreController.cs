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

            if (themes == null)
            {
                return NotFound("Themes not found.");
            }

            var banner = await _context.StoreBanners
                .Where(s => s.StoreID == store.StoreId)
                .FirstOrDefaultAsync();

            if (banner == null)
            {
                return NotFound("Banner not found.");
            }
            
            var logo = await _context.StoreLogos
                .Where(s => s.StoreID == store.StoreId)
                .FirstOrDefaultAsync();

            if (logo == null)
            {
                return NotFound("Logo not found.");
            }
        

            // 🔹 Fetch categories linked to this store
            var categories = await _context.Categories
                .Where(c => c.StoreId == store.StoreId)
                .ToListAsync();
            
            StoreDetails storeDetails = new StoreDetails(
                store.StoreId,
                store.StoreUrl,
                store.Name,
                themes.Theme_1,
                themes.Theme_2,
                themes.Theme_3,
                themes.FontColor,
                themes.FontFamily,
                themes.BannerText,
                themes.LogoText,
                string.IsNullOrEmpty(banner?.BannerURL) ? "" : banner.BannerURL,
                string.IsNullOrEmpty(logo?.LogoURL) ? "" : logo.LogoURL,
                categories,
                themes.ComponentVisibility
            );

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
            
            StoreDetails storeDetails = new StoreDetails(
                store.StoreId,
                store.StoreUrl,
                store.Name,
                themes?.Theme_1 ?? "#393727",
                themes?.Theme_2 ?? "#D0933D",
                themes?.Theme_3 ?? "#D3CEBB",
                themes?.FontColor ?? "#333333",
                themes?.FontFamily ?? "sans-serif",
                themes?.BannerText ?? "Welcome to our store",
                themes?.LogoText ?? store.Name,
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
                userEmail = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
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
            var existingStore = await _context.Stores
                .Where(s => s.StoreOwnerId == userId)
                .FirstOrDefaultAsync();

            if (existingStore != null)
            {
                return BadRequest("User already has a store");
            }

            // Check if store URL is unique
            var storeWithSameUrl = await _context.Stores
                .Where(s => s.StoreUrl == storeDetails.URL)
                .FirstOrDefaultAsync();

            if (storeWithSameUrl != null)
            {
                return BadRequest("Store URL already exists");
            }

            // Check if store name (username) already exists
            string storeName = username;
            int suffix = 1;
            
            // Keep checking with incrementing numbers until we find a unique name
            while (await _context.Stores.AnyAsync(s => s.Name == storeName))
            {
                storeName = $"{username}{suffix}";
                suffix++;
            }

            // Create new store with the extracted and validated username
            var store = new Store
            {
                StoreOwnerId = userId,
                Name = storeName,
                StoreUrl = storeDetails.URL
            };

            _context.Stores.Add(store);
            await _context.SaveChangesAsync();

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
            
            await _context.SaveChangesAsync();

            // Return the created store details with the actual store name used
            storeDetails.Id = store.StoreId;
            storeDetails.Name = storeName; // Update the name in the response
            return CreatedAtAction(nameof(GetStoreDetails), new { url = store.StoreUrl }, storeDetails);
        }

        // Update store configuration
        [HttpPut("update")]
        [Authorize]
        public async Task<ActionResult<StoreDetails>> UpdateStore([FromBody] StoreDetails storeDetails)
        {
            // Get the user ID from the token - look for numeric claim
            int userId = 0;
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

            // Check if this is the user's store
            var store = await _context.Stores
                .Where(s => s.StoreId == storeDetails.Id)
                .FirstOrDefaultAsync();

            if (store == null)
            {
                return NotFound("Store not found");
            }

            if (store.StoreOwnerId != userId)
            {
                return Forbid("You don't have permission to update this store");
            }

            // If changing URL, check if it's unique
            if (store.StoreUrl != storeDetails.URL)
            {
                var storeWithSameUrl = await _context.Stores
                    .Where(s => s.StoreUrl == storeDetails.URL && s.StoreId != storeDetails.Id)
                    .FirstOrDefaultAsync();

                if (storeWithSameUrl != null)
                {
                    return BadRequest("Store URL already exists");
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

            await _context.SaveChangesAsync();

            // Return the updated store details
            return Ok(storeDetails);
        }
    }
}