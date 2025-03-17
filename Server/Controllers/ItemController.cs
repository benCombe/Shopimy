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
    public class ItemController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public ItemController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // POST: api/account/login
        [HttpPost("listing")]
        [AllowAnonymous]
        public async Task<ActionResult<object>> Listing([FromBody] ListingDetails login)
        {
            // Find user by email
            var user = await _context.Listing.FirstOrDefaultAsync(u => u.ListId == login.Id);
            if (user == null)
            {
                return Unauthorized("Invalid email or password.");
            }

            // Return user data and token
            return Ok(new
            {
                Listing = new
                {
                    user.ListId,
                    user.Description,
                    user.StoreId,
                    user.Name,
                    user.CategoryId,
                }
            });
        }

        [HttpPost("listing")]
        [AllowAnonymous]
        public async Task<IActionResult> Test()
        {
            var t =_context.Listing.FromSqlRaw(@"SELECT * FROM Listing").ToListAsync();
            return Ok(t);
        }
    }

}