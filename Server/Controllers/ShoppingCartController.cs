using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Server.Data;
using Server.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;



[Route("api/[controller]")]
[ApiController]
public class ShoppingCartController : ControllerBase
{
    private readonly AppDbContext _context;

    public ShoppingCartController(AppDbContext context)
    {
        _context = context;
    }

    // POST: api/shoppingcart/add
    [HttpPost("add")]
    public async Task<IActionResult> AddOrUpdateItem([FromBody] ShoppingCartItem cartItem)
    {
        if (cartItem.Quantity <= 0)
        {
            return BadRequest("Quantity must be greater than zero.");
        }

        var existingCartItem = await _context.ShoppingCarts
            .FirstOrDefaultAsync(c => c.StoreId == cartItem.StoreId &&
                                      c.UserId == cartItem.UserId &&
                                      c.ItemId == cartItem.ItemId);

        if (existingCartItem != null)
        {
            // Update quantity
            existingCartItem.Quantity += cartItem.Quantity;
        }
        else
        {
            // Add new entry
            _context.ShoppingCarts.Add(new ShoppingCart
            {
                StoreId = cartItem.StoreId,
                UserId = cartItem.UserId,
                ItemId = cartItem.ItemId,
                Quantity = cartItem.Quantity
            });
        }

        await _context.SaveChangesAsync();
        return Ok("Item added or updated in cart.");
    }

    // DELETE: api/shoppingcart/remove
    [HttpDelete("remove")]
    public async Task<IActionResult> RemoveItem([FromBody] ShoppingCartItem cartItem)
    {
        var existingCartItem = await _context.ShoppingCarts
            .FirstOrDefaultAsync(c => c.StoreId == cartItem.StoreId &&
                                      c.UserId == cartItem.UserId &&
                                      c.ItemId == cartItem.ItemId);

        if (existingCartItem == null)
        {
            return NotFound("Item not found in cart.");
        }

        _context.ShoppingCarts.Remove(existingCartItem);
        await _context.SaveChangesAsync();
        return Ok("Item removed from cart.");
    }
}
