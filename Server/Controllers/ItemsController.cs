using Microsoft.AspNetCore.Mvc;
using YourProject.Models; // for UpdateStockDTO and Item
using YourProject.Repositories; // your repository interface

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
        // Retrieve the item (ensure you check for null and proper ownership if needed)
        var item = await _itemRepository.GetItemByIdAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        // Update the stock level
        item.QuantityInStock = dto.QuantityInStock;
        await _itemRepository.UpdateItemAsync(item);

        return Ok(item);
    }
}
