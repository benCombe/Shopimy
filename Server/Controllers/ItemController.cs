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

        
        [HttpGet("BasicItem/{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetBasicItem(int id)
        {
            var item = await _context.BasicItem.FromSqlRaw(@"SELECT TOP 1
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
                                                        LEFT JOIN Listing AS l ON l.list_id = i.list_id
                                                        LEFT JOIN ItemImages AS img ON img.item_id= i.item_id
                                                        where l.list_id = {0}
                                                        order by i.price;",id)
                                                        .ToListAsync();

            if (item == null || item.Count == 0) return NotFound();
            return Ok(item);
        }

         [HttpPost("DetailItem")]
        [AllowAnonymous]
        public async Task<IActionResult> DetailItem(int id)
        {
            var item = await _context.DetailItem.FromSqlRaw(@"SELECT
                                                        l.list_id as ListId,
                                                        i.item_id as ItemId,
                                                        l.store_id as StoreId,
                                                        l.category as CategoryId,
                                                        l.name as Name,
                                                        i.price as Price,
                                                        i.colour as Colour,
                                                        i.size as Size,
                                                        i.type as Type,
                                                        i.sale_price as SalePrice,
                                                        i.quantity as Quantity,
                                                        l.availFrom as AvailFrom,
                                                        l.availTo as AvailTo,
                                                        l.description as Description,
                                                        l.currentRating as CurrentRating,
                                                        img.blob as Blob
                                                        FROM Items AS i
                                                        JOIN Listing AS l ON l.list_id = i.list_id
                                                        JOIN ItemImages AS img ON img.item_id= i.item_id
                                                        where l.list_id ={0}
                                                        order by i.price;",id).ToListAsync();
            return Ok(item);
        }
    }

}