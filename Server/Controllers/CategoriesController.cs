using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Server.Data;
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
    public async Task<IActionResult> GetCategories()
    {
        // retrieve the current store's id from the user claims or session
        int storeId = GetCurrentStoreId();
        var categories = await _categoryService.GetCategoriesForStoreAsync(storeId);
        return Ok(categories);
    }

/*     [HttpPost]
    public async Task<IActionResult> CreateCategory([FromBody] Category dto)
    {
        int storeId = GetCurrentStoreId();
        var createdCategory = await _categoryService.CreateCategoryAsync(storeId, dto);
        return CreatedAtAction(nameof(GetCategoryById), new { id = createdCategory.CategoryId }, createdCategory);
    } */

    /* [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCategoryById(int id)
    {
        int storeId = GetCurrentStoreId();
        var category = await _categoryService.GetCategoryByIdAsync(storeId, id);
        if (category == null) return NotFound();
        return Ok(category);
    }
 */

    //for main store page, returns array of random ids
    [HttpPost("GetItemIdsByStore")]
    [AllowAnonymous]
    public async Task<int[]> GetItemIdsByStore([FromBody] int storeid)
    {
        Console.WriteLine("Store ID: " + storeid);
        string connectionString = configuration.GetConnectionString("DefaultConnection");
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
        string connectionString = configuration.GetConnectionString("DefaultConnection");
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
        return int.Parse(_httpContextAccessor.HttpContext.User.FindFirst("storeId")?.Value ?? "0");
    }
}
