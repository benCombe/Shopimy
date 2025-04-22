using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Server.Data;
using System.Dynamic;
using Shopimy.Server.Models;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;
    private readonly IHttpContextAccessor _httpContextAccessor; // if need to retrieve the current store context
    private readonly IConfiguration configuration;

    public CategoriesController(ICategoryService categoryService, IHttpContextAccessor httpContextAccessor, IConfiguration configuration)
    {
        _categoryService = categoryService;
        _httpContextAccessor = httpContextAccessor;
        this.configuration = configuration;
    }

    [HttpGet]
    public async Task<IActionResult> GetCategories([FromQuery] int? storeId = null)
    {
        // Priority 1: Use the storeId from query parameter if provided
        // Priority 2: Retrieve from claims if available
        int effectiveStoreId = storeId ?? GetCurrentStoreId();
        
        // If we still don't have a valid storeId, return an error
        if (effectiveStoreId <= 0)
        {
            return BadRequest(new { error = "Store ID is required but was not provided in the request or found in the user context." });
        }
        
        var categories = await _categoryService.GetCategoriesForStoreAsync(effectiveStoreId);
        return Ok(categories);
    }

    [HttpPost]
    public async Task<IActionResult> CreateCategory([FromBody] Category.CreateCategory dto)
    {
        try
        {
            // Determine store ID from claims or use client-provided StoreId
            int storeId = GetCurrentStoreId();
            if (storeId <= 0 && dto.StoreId.HasValue && dto.StoreId.Value > 0)
            {
                storeId = dto.StoreId.Value;
            }
            
            var category = new Category
            {
                Name = dto.Name,
                ParentCategory = dto.ParentCategory,
                StoreId = storeId
            };
            
            var createdCategory = await _categoryService.CreateCategoryAsync(storeId, category);
            return CreatedAtAction(nameof(GetCategoryById), new { id = createdCategory.CategoryId }, createdCategory);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "An error occurred while creating the category." });
        }
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCategoryById(int id)
    {
        int storeId = GetCurrentStoreId();
        var category = await _categoryService.GetCategoryByIdAsync(storeId, id);
        if (category == null) return NotFound();
        return Ok(category);
    }

    //for main store page, returns array of random ids
    [HttpPost("GetItemIdsByStore")]
    [AllowAnonymous]
    public async Task<int[]> GetItemIdsByStore([FromBody] int storeid)
    {
        Console.WriteLine("Store ID: " + storeid);
        // Allow connection string to be potentially null
        string? connectionString = configuration.GetConnectionString("DefaultConnection");
        // Add null/empty check for connection string
        if (string.IsNullOrEmpty(connectionString))
        {
            // Log error or return appropriate response
            Console.Error.WriteLine("Database connection string 'DefaultConnection' not configured.");
            return Array.Empty<int>(); // Return empty array or throw exception
        }
        string query = @"SELECT list_id
                        FROM Listing
                        WHERE store_id = @storeid;
                        ";
        List<int> listIds = new List<int>();

        using (SqlConnection connection = new SqlConnection(connectionString))
        {
            connection.Open();
            using (SqlCommand command = new SqlCommand(query, connection))
            {
                command.Parameters.AddWithValue("@storeid", storeid);
                using (SqlDataReader reader = command.ExecuteReader())
                {
                    while (await reader.ReadAsync())
                    {
                         listIds.Add(reader.GetInt32(0));
                    }
                }
            }
        }
        return listIds.OrderBy(_ => Guid.NewGuid()).ToArray(); //random order
    }

    [HttpGet("{catid}/{storeid}")]
    [AllowAnonymous]
    public async Task<int[]> GetItemIdsByCategory(int catid, int storeid){
        Console.WriteLine("catid: " + catid + " storeid: " + storeid);
        // Allow connection string to be potentially null
        string? connectionString = configuration.GetConnectionString("DefaultConnection");
        // Add null/empty check for connection string
        if (string.IsNullOrEmpty(connectionString))
        {
            // Log error or return appropriate response
            Console.Error.WriteLine("Database connection string 'DefaultConnection' not configured.");
            return Array.Empty<int>(); // Return empty array or throw exception
        }
        string query = @"SELECT l.list_id
                        FROM Listing l
                        JOIN Categories c ON l.category = c.category_id
                        WHERE (c.category_id = @catid OR c.parent_category = @catid)
                        AND l.store_id = @storeid;
                        ";
        List<int> listIds = new List<int>();

        using (SqlConnection connection = new SqlConnection(connectionString))
        {
            connection.Open();
            using (SqlCommand command = new SqlCommand(query, connection))
            {
                command.Parameters.AddWithValue("@catid", catid);
                command.Parameters.AddWithValue("@storeid", storeid);
                using (SqlDataReader reader = command.ExecuteReader())
                {
                    while (await reader.ReadAsync())
                    {
                         listIds.Add(reader.GetInt32(0));
                    }
                }
            }
        }
        return listIds.ToArray();
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
        // Use null-conditional operator ?. on HttpContext
        var storeIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst("storeId");
        // Safely parse the value, defaulting to 0 if null or invalid
        int.TryParse(storeIdClaim?.Value, out int storeId);
        return storeId; // Returns 0 if parsing fails or claim is not found
    }
}
