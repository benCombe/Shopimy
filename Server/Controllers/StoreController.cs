using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Server.Data;
using Server.Models;
using Shopimy.Server.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;


namespace Server.Controllers
{

    public class StoreResponse
    {
        public StoreDetails Store { get; set; }
        public List<Category> Categories { get; set; }
    }

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
        public async Task<ActionResult<StoreResponse>> GetStoreDetails(string url)
        {
            // 🔹 Get store details from Stores or StoreWithTheme view
            var store = await _context.StoreWithTheme
                .Where(s => s.URL == url)
                .Select(s => new 
                {
                    s.Id,
                    s.URL,
                    s.Name,
                    s.Theme_1,
                    s.Theme_2,
                    s.Theme_3,
                    s.FontFamily,
                    s.FontColor,
                    s.BannerText,
                    s.LogoText
                })
                .FirstOrDefaultAsync();

            if (store == null)
            {
                return NotFound("Store not found.");
            }

            // 🔹 Fetch categories linked to this store
            var categories = await _context.Categories
                .Where(c => c.StoreId == store.Id)
                .ToListAsync();

            // ✅ Return both store details and categories
            return Ok(new
            {
                StoreDetails = store,
                Categories = categories
            });
        }

    }


}