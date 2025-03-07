/* using Microsoft.AspNetCore.Mvc;
using Shopimy.Server.Models; // Update to match your project structure
using Shopimy.Server.Repositories; // Update accordingly
using System;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class ItemsController : ControllerBase
{
    private readonly IItemRepository _itemRepository;

    public ItemsController(IItemRepository itemRepository)
    {
        _itemRepository = itemRepository;
    }

    // PUT api/items/{id}/stock
    [HttpPut("{id}/stock")]
    public async Task<IActionResult> UpdateStock(string id, [FromBody] UpdateStockDTO dto)
    {

        if (dto.QuantityInStock < 0)
        {
            return BadRequest("Stock level cannot be negative.");
        }

        var item = await _itemRepository.GetItemByIdAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        // Update the stock level
        item.QuantityInStock = dto.QuantityInStock;
        await _itemRepository.UpdateItemAsync(item);
        try
        {
            item.QuantityInStock = dto.QuantityInStock;
            await _itemRepository.UpdateItemAsync(item);
        }
        catch (Exception ex)
        {
            // Log the exception (using your logging strategy)
            return StatusCode(500, "An error occurred while updating stock.");
        }

        return Ok(item);
    }
}
 */


 //Commented out due to causing errors