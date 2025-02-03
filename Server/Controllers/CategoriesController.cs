using Microsoft.AspNetCore.Mvc;
using Shopimy.Server.Models;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;
    private readonly IHttpContextAccessor _httpContextAccessor; // if need to retrieve the current store context

    public CategoriesController(ICategoryService categoryService, IHttpContextAccessor httpContextAccessor)
    {
        _categoryService = categoryService;
        _httpContextAccessor = httpContextAccessor;
    }

    [HttpGet]
    public async Task<IActionResult> GetCategories()
    {
        // retrieve the current store's id from the user claims or session
        int storeId = GetCurrentStoreId();
        var categories = await _categoryService.GetCategoriesForStoreAsync(storeId);
        return Ok(categories);
    }

    [HttpPost]
    public async Task<IActionResult> CreateCategory([FromBody] Category dto)
    {
        int storeId = GetCurrentStoreId();
        var createdCategory = await _categoryService.CreateCategoryAsync(storeId, dto);
        return CreatedAtAction(nameof(GetCategoryById), new { id = createdCategory.CategoryId }, createdCategory);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetCategoryById(int id)
    {
        int storeId = GetCurrentStoreId();
        var category = await _categoryService.GetCategoryByIdAsync(storeId, id);
        if (category == null) return NotFound();
        return Ok(category);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCategory(int id, [FromBody] Category dto)
    {
        int storeId = GetCurrentStoreId();
        var updatedCategory = await _categoryService.UpdateCategoryAsync(storeId, id, dto);
        if (updatedCategory == null) return NotFound();
        return Ok(updatedCategory);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        int storeId = GetCurrentStoreId();
        var category = await _categoryService.GetCategoryByIdAsync(storeId, id);
        if (category == null) return NotFound();

        await _categoryService.DeleteCategoryAsync(storeId, id);
        return Ok(category);
    }



    private int GetCurrentStoreId()
    {
        // This is where you'd retrieve the current store's ID, perhaps from the authenticated user's claims.
        // For now, you can simulate it or get it from the HttpContext.
        return int.Parse(_httpContextAccessor.HttpContext.User.FindFirst("storeId")?.Value ?? "0");
    }
}
