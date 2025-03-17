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

        
        [HttpPost("BasicItem")]
        [AllowAnonymous]
        public async Task<IActionResult> BasicItem(int id)
        {
            var item =await _context.BasicItem.FromSqlRaw(@"SELECT TOP 1
                                                        l.list_id,
                                                        i.item_id,
                                                        l.store_id,
                                                        l.category,
                                                        l.name,
                                                        i.price,
                                                        i.sale_price,
                                                        i.quantity,
                                                        l.availFrom,
                                                        l.availTo,
                                                        img.blob
                                                        FROM Items AS i
                                                        JOIN Listing AS l ON l.list_id = i.list_id
                                                        JOIN ItemImages AS img ON img.item_id= i.item_id
                                                        where l.list_id ={0}
                                                        order by i.price;",id).ToListAsync();
            return Ok(item);
        }
    }

}