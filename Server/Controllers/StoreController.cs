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
            // Get the user ID from the token
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (userId == 0)
            {
                return Unauthorized("Invalid user authentication");
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
            // Get the user ID from the token
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (userId == 0)
            {
                return Unauthorized("Invalid user authentication");
            }

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

            // Create new store
            var store = new Store
            {
                StoreOwnerId = userId,
                Name = storeDetails.Name,
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
                LogoText = storeDetails.LogoText,
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

            // Return the created store details
            storeDetails.Id = store.StoreId;
            return CreatedAtAction(nameof(GetStoreDetails), new { url = store.StoreUrl }, storeDetails);
        }

        // Update store configuration
        [HttpPut("update")]
        [Authorize]
        public async Task<ActionResult<StoreDetails>> UpdateStore([FromBody] StoreDetails storeDetails)
        {
            // Get the user ID from the token
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (userId == 0)
            {
                return Unauthorized("Invalid user authentication");
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