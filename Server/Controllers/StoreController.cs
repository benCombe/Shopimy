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
                categories
            );

            // ✅ Return both store details and categories
            return Ok(storeDetails);
        }
    }

}