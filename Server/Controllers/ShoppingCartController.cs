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


    [HttpGet("cart")]
    public async Task<IActionResult> GetShoppingCartItems([FromHeader] string authorization)
    {
        if (string.IsNullOrEmpty(authorization))
        {
            return Unauthorized("No token provided.");
        }

        // Extract token from "Bearer <token>"
        string token = authorization.StartsWith("Bearer ") ? authorization.Substring(7) : authorization;

        try
        {
            // Find the user_id associated with the token
            var activeUser = await _context.ActiveUsers
                .FirstOrDefaultAsync(a => a.Token == token);

            if (activeUser == null)
            {
                return Unauthorized("Invalid or expired token.");
            }

            int userId = activeUser.UserId;

            // Fetch shopping cart items for the user
            var cartItems = await _context.ShoppingCarts
                .Where(cart => cart.UserId == userId)
                .ToListAsync();

            return Ok(cartItems);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred: {ex.Message}");
        }
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


    [HttpPost("place_order")]
    public async Task<IActionResult> PlaceOrder([FromBody] Order order){
        
        if (order == null || order.OrderItems == null || order.OrderItems.Count <= 0){
            return BadRequest("Invalid Request: Order or OrderItems missing or empty.");
        }

        OrderLogEntry entry = new(order);
        _context.OrderLog.Add(entry);
        await _context.SaveChangesAsync();

        int logEntryId = entry.OrderId;

        return Ok(logEntryId);
    }
}
