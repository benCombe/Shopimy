using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Server.Data;
using Server.Models;
using Shopimy.Server.Models;
using System.Data;
using System.Dynamic;
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
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ItemController(AppDbContext context, IConfiguration configuration, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
        }

        // GET: api/item/basicitem/{id}
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


        // GET: api/item/bystore/{storeId}
        [HttpGet("bystore/{storeId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetItemsByStore(int storeId)
        {
            string connectionString = _configuration.GetConnectionString("DefaultConnection");
            if (string.IsNullOrEmpty(connectionString))
            {
                return StatusCode(500, "Database connection not configured");
            }

            var listings = new List<dynamic>();

            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                await connection.OpenAsync();
                string query = @"
                    SELECT l.list_id, l.name, l.description, l.category, c.name as category_name,
                           MIN(i.price) as min_price, MAX(i.price) as max_price,
                           SUM(i.quantity) as total_quantity,
                           (SELECT TOP 1 img.blob FROM ItemImages img 
                            JOIN Items i2 ON img.item_id = i2.item_id 
                            WHERE i2.list_id = l.list_id AND img.item_index = 0) as image_url,
                           l.availFrom, l.availTo
                    FROM Listing l
                    JOIN Items i ON l.list_id = i.list_id
                    LEFT JOIN Categories c ON l.category = c.category_id
                    WHERE l.store_id = @storeId
                    GROUP BY l.list_id, l.name, l.description, l.category, c.name, l.availFrom, l.availTo
                    ORDER BY l.list_id DESC";

                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@storeId", storeId);
                    
                    using (SqlDataReader reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            dynamic listing = new ExpandoObject();
                            listing.listId = reader.GetInt32(reader.GetOrdinal("list_id"));
                            listing.name = reader.GetString(reader.GetOrdinal("name"));
                            listing.description = reader.GetString(reader.GetOrdinal("description"));
                            listing.categoryId = reader.GetInt32(reader.GetOrdinal("category"));
                            listing.categoryName = !reader.IsDBNull(reader.GetOrdinal("category_name")) 
                                ? reader.GetString(reader.GetOrdinal("category_name")) 
                                : null;
                            listing.minPrice = reader.GetDecimal(reader.GetOrdinal("min_price"));
                            listing.maxPrice = reader.GetDecimal(reader.GetOrdinal("max_price"));
                            listing.totalQuantity = reader.GetInt32(reader.GetOrdinal("total_quantity"));
                            listing.imageUrl = !reader.IsDBNull(reader.GetOrdinal("image_url")) 
                                ? reader.GetString(reader.GetOrdinal("image_url")) 
                                : null;
                            listing.availFrom = !reader.IsDBNull(reader.GetOrdinal("availFrom")) 
                                ? (DateTime?)reader.GetDateTime(reader.GetOrdinal("availFrom")) 
                                : null;
                            listing.availTo = !reader.IsDBNull(reader.GetOrdinal("availTo")) 
                                ? (DateTime?)reader.GetDateTime(reader.GetOrdinal("availTo")) 
                                : null;
                            
                            listings.Add(listing);
                        }
                    }
                }
            }

            return Ok(listings);
        }

        // GET: api/item/{id}
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetItemById(int id)
        {
            string connectionString = _configuration.GetConnectionString("DefaultConnection");
            if (string.IsNullOrEmpty(connectionString))
            {
                return StatusCode(500, "Database connection not configured");
            }

            dynamic listing = null;
            var variants = new List<dynamic>();

            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                await connection.OpenAsync();
                string query = @"
                    SELECT l.list_id, l.name, l.description, l.category, c.name as category_name,
                           l.store_id, l.availFrom, l.availTo, l.currentRating
                    FROM Listing l
                    LEFT JOIN Categories c ON l.category = c.category_id
                    WHERE l.list_id = @listId";

                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@listId", id);
                    
                    using (SqlDataReader reader = await command.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            listing = new ExpandoObject();
                            listing.listId = reader.GetInt32(reader.GetOrdinal("list_id"));
                            listing.name = reader.GetString(reader.GetOrdinal("name"));
                            listing.description = reader.GetString(reader.GetOrdinal("description"));
                            listing.categoryId = reader.GetInt32(reader.GetOrdinal("category"));
                            listing.categoryName = !reader.IsDBNull(reader.GetOrdinal("category_name")) 
                                ? reader.GetString(reader.GetOrdinal("category_name")) 
                                : null;
                            listing.storeId = reader.GetInt32(reader.GetOrdinal("store_id"));
                            listing.availFrom = !reader.IsDBNull(reader.GetOrdinal("availFrom")) 
                                ? (DateTime?)reader.GetDateTime(reader.GetOrdinal("availFrom")) 
                                : null;
                            listing.availTo = !reader.IsDBNull(reader.GetOrdinal("availTo")) 
                                ? (DateTime?)reader.GetDateTime(reader.GetOrdinal("availTo")) 
                                : null;
                            listing.rating = !reader.IsDBNull(reader.GetOrdinal("currentRating")) 
                                ? reader.GetInt32(reader.GetOrdinal("currentRating")) 
                                : 0;
                            listing.variants = new List<dynamic>();
                        }
                        else
                        {
                            return NotFound("Listing not found");
                        }
                    }

                    // Get variants (items)
                    string variantsQuery = @"
                        SELECT i.item_id, i.price, i.sale_price, i.quantity, 
                               i.type, i.size, i.colour
                        FROM Items i
                        WHERE i.list_id = @listId";

                    using (SqlCommand variantsCommand = new SqlCommand(variantsQuery, connection))
                    {
                        variantsCommand.Parameters.AddWithValue("@listId", id);
                        
                        using (SqlDataReader variantsReader = await variantsCommand.ExecuteReaderAsync())
                        {
                            while (await variantsReader.ReadAsync())
                            {
                                dynamic variant = new ExpandoObject();
                                variant.itemId = variantsReader.GetInt32(variantsReader.GetOrdinal("item_id"));
                                variant.price = variantsReader.GetDecimal(variantsReader.GetOrdinal("price"));
                                variant.salePrice = variantsReader.GetDecimal(variantsReader.GetOrdinal("sale_price"));
                                variant.quantity = variantsReader.GetInt32(variantsReader.GetOrdinal("quantity"));
                                variant.type = !variantsReader.IsDBNull(variantsReader.GetOrdinal("type")) 
                                    ? variantsReader.GetString(variantsReader.GetOrdinal("type")) 
                                    : null;
                                variant.size = !variantsReader.IsDBNull(variantsReader.GetOrdinal("size")) 
                                    ? variantsReader.GetString(variantsReader.GetOrdinal("size")) 
                                    : null;
                                variant.colour = !variantsReader.IsDBNull(variantsReader.GetOrdinal("colour")) 
                                    ? variantsReader.GetString(variantsReader.GetOrdinal("colour")) 
                                    : null;
                                variant.images = new List<string>();
                                
                                variants.Add(variant);
                            }
                        }
                    }

                    // Get images for each variant
                    foreach (dynamic variant in variants)
                    {
                        int itemId = variant.itemId;
                        string imagesQuery = @"
                            SELECT blob
                            FROM ItemImages
                            WHERE item_id = @itemId
                            ORDER BY item_index";

                        using (SqlCommand imagesCommand = new SqlCommand(imagesQuery, connection))
                        {
                            imagesCommand.Parameters.AddWithValue("@itemId", itemId);
                            
                            using (SqlDataReader imagesReader = await imagesCommand.ExecuteReaderAsync())
                            {
                                var images = new List<string>();
                                while (await imagesReader.ReadAsync())
                                {
                                    images.Add(imagesReader.GetString(imagesReader.GetOrdinal("blob")));
                                }
                                variant.images = images;
                            }
                        }
                    }
                }
            }

            if (listing != null)
            {
                listing.variants = variants;
            }

            return Ok(listing);
        }

        // POST: api/item
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateProduct([FromBody] ProductCreateRequest request)
        {
            int storeId = GetCurrentStoreId();
            if (storeId <= 0 || storeId != request.StoreId)
            {
                return Unauthorized("Not authorized to create products for this store");
            }

            string connectionString = _configuration.GetConnectionString("DefaultConnection");
            if (string.IsNullOrEmpty(connectionString))
            {
                return StatusCode(500, "Database connection not configured");
            }

            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                await connection.OpenAsync();
                
                // Begin transaction to ensure all operations succeed or fail together
                using (SqlTransaction transaction = connection.BeginTransaction())
                {
                    try
                    {
                        // Create listing
                        int listingId;
                        using (SqlCommand command = new SqlCommand(@"
                            INSERT INTO Listing (store_id, name, description, category, availFrom, availTo)
                            VALUES (@storeId, @name, @description, @categoryId, @availFrom, @availTo);
                            SELECT SCOPE_IDENTITY();", connection, transaction))
                        {
                            command.Parameters.AddWithValue("@storeId", request.StoreId);
                            command.Parameters.AddWithValue("@name", request.Name);
                            command.Parameters.AddWithValue("@description", request.Description);
                            command.Parameters.AddWithValue("@categoryId", request.CategoryId);
                            
                            if (request.AvailFrom.HasValue)
                                command.Parameters.AddWithValue("@availFrom", request.AvailFrom);
                            else
                                command.Parameters.AddWithValue("@availFrom", DBNull.Value);
                                
                            if (request.AvailTo.HasValue)
                                command.Parameters.AddWithValue("@availTo", request.AvailTo);
                            else
                                command.Parameters.AddWithValue("@availTo", DBNull.Value);
                            
                            var result = await command.ExecuteScalarAsync();
                            listingId = Convert.ToInt32(result);
                        }
                        
                        // Process variants
                        foreach (var variant in request.Variants)
                        {
                            // Create item (variant)
                            int itemId;
                            using (SqlCommand command = new SqlCommand(@"
                                INSERT INTO Items (list_id, price, sale_price, type, size, colour, quantity)
                                VALUES (@listId, @price, @salePrice, @type, @size, @colour, @quantity);
                                SELECT SCOPE_IDENTITY();", connection, transaction))
                            {
                                command.Parameters.AddWithValue("@listId", listingId);
                                command.Parameters.AddWithValue("@price", variant.Price);
                                command.Parameters.AddWithValue("@salePrice", variant.SalePrice);
                                command.Parameters.AddWithValue("@quantity", variant.Quantity);
                                
                                if (!string.IsNullOrEmpty(variant.Type))
                                    command.Parameters.AddWithValue("@type", variant.Type);
                                else
                                    command.Parameters.AddWithValue("@type", DBNull.Value);
                                    
                                if (!string.IsNullOrEmpty(variant.Size))
                                    command.Parameters.AddWithValue("@size", variant.Size);
                                else
                                    command.Parameters.AddWithValue("@size", DBNull.Value);
                                    
                                if (!string.IsNullOrEmpty(variant.Colour))
                                    command.Parameters.AddWithValue("@colour", variant.Colour);
                                else
                                    command.Parameters.AddWithValue("@colour", DBNull.Value);
                                
                                var result = await command.ExecuteScalarAsync();
                                itemId = Convert.ToInt32(result);
                            }
                            
                            // Add images if provided
                            if (variant.Images != null && variant.Images.Count > 0)
                            {
                                for (int i = 0; i < variant.Images.Count; i++)
                                {
                                    using (SqlCommand command = new SqlCommand(@"
                                        INSERT INTO ItemImages (store_id, user_id, item_id, item_index, blob)
                                        VALUES (@storeId, @userId, @itemId, @itemIndex, @blob)", connection, transaction))
                                    {
                                        command.Parameters.AddWithValue("@storeId", request.StoreId);
                                        command.Parameters.AddWithValue("@userId", GetCurrentUserId());
                                        command.Parameters.AddWithValue("@itemId", itemId);
                                        command.Parameters.AddWithValue("@itemIndex", i);
                                        command.Parameters.AddWithValue("@blob", variant.Images[i]);
                                        
                                        await command.ExecuteNonQueryAsync();
                                    }
                                }
                            }
                        }
                        
                        // Commit the transaction
                        transaction.Commit();
                        
                        return CreatedAtAction(nameof(GetItemById), new { id = listingId }, new { listId = listingId });
                    }
                    catch (Exception ex)
                    {
                        // Rollback on error
                        transaction.Rollback();
                        return StatusCode(500, $"An error occurred while creating the product: {ex.Message}");
                    }
                }
            }
        }

        // PUT: api/item/{id}
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] ProductUpdateRequest request)
        {
            int storeId = GetCurrentStoreId();
            if (storeId <= 0)
            {
                return Unauthorized("Store ID not found in claims or invalid");
            }

            string connectionString = _configuration.GetConnectionString("DefaultConnection");
            if (string.IsNullOrEmpty(connectionString))
            {
                return StatusCode(500, "Database connection not configured");
            }

            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                await connection.OpenAsync();
                
                // Verify ownership of the listing
                string verifyQuery = "SELECT store_id FROM Listing WHERE list_id = @listId";
                using (SqlCommand verifyCommand = new SqlCommand(verifyQuery, connection))
                {
                    verifyCommand.Parameters.AddWithValue("@listId", id);
                    var result = await verifyCommand.ExecuteScalarAsync();
                    
                    if (result == null)
                    {
                        return NotFound("Listing not found");
                    }
                    
                    int listingStoreId = Convert.ToInt32(result);
                    if (listingStoreId != storeId)
                    {
                        return Unauthorized("Not authorized to update this listing");
                    }
                }
                
                // Begin transaction
                using (SqlTransaction transaction = connection.BeginTransaction())
                {
                    try
                    {
                        // Update listing
                        using (SqlCommand command = new SqlCommand(@"
                            UPDATE Listing
                            SET name = @name, 
                                description = @description, 
                                category = @categoryId,
                                availFrom = @availFrom,
                                availTo = @availTo
                            WHERE list_id = @listId", connection, transaction))
                        {
                            command.Parameters.AddWithValue("@listId", id);
                            command.Parameters.AddWithValue("@name", request.Name);
                            command.Parameters.AddWithValue("@description", request.Description);
                            command.Parameters.AddWithValue("@categoryId", request.CategoryId);
                            
                            if (request.AvailFrom.HasValue)
                                command.Parameters.AddWithValue("@availFrom", request.AvailFrom);
                            else
                                command.Parameters.AddWithValue("@availFrom", DBNull.Value);
                                
                            if (request.AvailTo.HasValue)
                                command.Parameters.AddWithValue("@availTo", request.AvailTo);
                            else
                                command.Parameters.AddWithValue("@availTo", DBNull.Value);
                            
                            await command.ExecuteNonQueryAsync();
                        }
                        
                        // Process variants
                        foreach (var variant in request.Variants)
                        {
                            if (variant.ItemId > 0) // Update existing variant
                            {
                                using (SqlCommand command = new SqlCommand(@"
                                    UPDATE Items
                                    SET price = @price, 
                                        sale_price = @salePrice,
                                        type = @type,
                                        size = @size,
                                        colour = @colour,
                                        quantity = @quantity
                                    WHERE item_id = @itemId AND list_id = @listId", connection, transaction))
                                {
                                    command.Parameters.AddWithValue("@itemId", variant.ItemId);
                                    command.Parameters.AddWithValue("@listId", id);
                                    command.Parameters.AddWithValue("@price", variant.Price);
                                    command.Parameters.AddWithValue("@salePrice", variant.SalePrice);
                                    command.Parameters.AddWithValue("@quantity", variant.Quantity);
                                    
                                    if (!string.IsNullOrEmpty(variant.Type))
                                        command.Parameters.AddWithValue("@type", variant.Type);
                                    else
                                        command.Parameters.AddWithValue("@type", DBNull.Value);
                                        
                                    if (!string.IsNullOrEmpty(variant.Size))
                                        command.Parameters.AddWithValue("@size", variant.Size);
                                    else
                                        command.Parameters.AddWithValue("@size", DBNull.Value);
                                        
                                    if (!string.IsNullOrEmpty(variant.Colour))
                                        command.Parameters.AddWithValue("@colour", variant.Colour);
                                    else
                                        command.Parameters.AddWithValue("@colour", DBNull.Value);
                                    
                                    await command.ExecuteNonQueryAsync();
                                }
                                
                                // Handle image updates if needed
                                if (variant.Images != null && variant.Images.Count > 0)
                                {
                                    // First delete existing images
                                    using (SqlCommand command = new SqlCommand(
                                        "DELETE FROM ItemImages WHERE item_id = @itemId", connection, transaction))
                                    {
                                        command.Parameters.AddWithValue("@itemId", variant.ItemId);
                                        await command.ExecuteNonQueryAsync();
                                    }
                                    
                                    // Then add new images
                                    for (int i = 0; i < variant.Images.Count; i++)
                                    {
                                        using (SqlCommand command = new SqlCommand(@"
                                            INSERT INTO ItemImages (store_id, user_id, item_id, item_index, blob)
                                            VALUES (@storeId, @userId, @itemId, @itemIndex, @blob)", connection, transaction))
                                        {
                                            command.Parameters.AddWithValue("@storeId", storeId);
                                            command.Parameters.AddWithValue("@userId", GetCurrentUserId());
                                            command.Parameters.AddWithValue("@itemId", variant.ItemId);
                                            command.Parameters.AddWithValue("@itemIndex", i);
                                            command.Parameters.AddWithValue("@blob", variant.Images[i]);
                                            
                                            await command.ExecuteNonQueryAsync();
                                        }
                                    }
                                }
                            }
                            else // Add new variant
                            {
                                // Create item (variant)
                                int itemId;
                                using (SqlCommand command = new SqlCommand(@"
                                    INSERT INTO Items (list_id, price, sale_price, type, size, colour, quantity)
                                    VALUES (@listId, @price, @salePrice, @type, @size, @colour, @quantity);
                                    SELECT SCOPE_IDENTITY();", connection, transaction))
                                {
                                    command.Parameters.AddWithValue("@listId", id);
                                    command.Parameters.AddWithValue("@price", variant.Price);
                                    command.Parameters.AddWithValue("@salePrice", variant.SalePrice);
                                    command.Parameters.AddWithValue("@quantity", variant.Quantity);
                                    
                                    if (!string.IsNullOrEmpty(variant.Type))
                                        command.Parameters.AddWithValue("@type", variant.Type);
                                    else
                                        command.Parameters.AddWithValue("@type", DBNull.Value);
                                        
                                    if (!string.IsNullOrEmpty(variant.Size))
                                        command.Parameters.AddWithValue("@size", variant.Size);
                                    else
                                        command.Parameters.AddWithValue("@size", DBNull.Value);
                                        
                                    if (!string.IsNullOrEmpty(variant.Colour))
                                        command.Parameters.AddWithValue("@colour", variant.Colour);
                                    else
                                        command.Parameters.AddWithValue("@colour", DBNull.Value);
                                    
                                    var result = await command.ExecuteScalarAsync();
                                    itemId = Convert.ToInt32(result);
                                }
                                
                                // Add images if provided
                                if (variant.Images != null && variant.Images.Count > 0)
                                {
                                    for (int i = 0; i < variant.Images.Count; i++)
                                    {
                                        using (SqlCommand command = new SqlCommand(@"
                                            INSERT INTO ItemImages (store_id, user_id, item_id, item_index, blob)
                                            VALUES (@storeId, @userId, @itemId, @itemIndex, @blob)", connection, transaction))
                                        {
                                            command.Parameters.AddWithValue("@storeId", storeId);
                                            command.Parameters.AddWithValue("@userId", GetCurrentUserId());
                                            command.Parameters.AddWithValue("@itemId", itemId);
                                            command.Parameters.AddWithValue("@itemIndex", i);
                                            command.Parameters.AddWithValue("@blob", variant.Images[i]);
                                            
                                            await command.ExecuteNonQueryAsync();
                                        }
                                    }
                                }
                            }
                        }
                        
                        // Delete variants that were removed (if any items in request.DeletedVariantIds)
                        if (request.DeletedVariantIds != null && request.DeletedVariantIds.Count > 0)
                        {
                            foreach (int variantId in request.DeletedVariantIds)
                            {
                                // First delete related images
                                using (SqlCommand command = new SqlCommand(
                                    "DELETE FROM ItemImages WHERE item_id = @itemId", connection, transaction))
                                {
                                    command.Parameters.AddWithValue("@itemId", variantId);
                                    await command.ExecuteNonQueryAsync();
                                }
                                
                                // Then delete the variant
                                using (SqlCommand command = new SqlCommand(
                                    "DELETE FROM Items WHERE item_id = @itemId AND list_id = @listId", connection, transaction))
                                {
                                    command.Parameters.AddWithValue("@itemId", variantId);
                                    command.Parameters.AddWithValue("@listId", id);
                                    await command.ExecuteNonQueryAsync();
                                }
                            }
                        }
                        
                        // Commit the transaction
                        transaction.Commit();
                        
                        return Ok(new { listId = id, message = "Product updated successfully" });
                    }
                    catch (Exception ex)
                    {
                        // Rollback on error
                        transaction.Rollback();
                        return StatusCode(500, $"An error occurred while updating the product: {ex.Message}");
                    }
                }
            }
        }

        // DELETE: api/item/{id}
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            int storeId = GetCurrentStoreId();
            if (storeId <= 0)
            {
                return Unauthorized("Store ID not found in claims or invalid");
            }

            string connectionString = _configuration.GetConnectionString("DefaultConnection");
            if (string.IsNullOrEmpty(connectionString))
            {
                return StatusCode(500, "Database connection not configured");
            }

            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                await connection.OpenAsync();
                
                // Verify ownership of the listing
                string verifyQuery = "SELECT store_id FROM Listing WHERE list_id = @listId";
                using (SqlCommand verifyCommand = new SqlCommand(verifyQuery, connection))
                {
                    verifyCommand.Parameters.AddWithValue("@listId", id);
                    var result = await verifyCommand.ExecuteScalarAsync();
                    
                    if (result == null)
                    {
                        return NotFound("Listing not found");
                    }
                    
                    int listingStoreId = Convert.ToInt32(result);
                    if (listingStoreId != storeId)
                    {
                        return Unauthorized("Not authorized to delete this listing");
                    }
                }
                
                // Begin transaction
                using (SqlTransaction transaction = connection.BeginTransaction())
                {
                    try
                    {
                        // Delete all related images for all variants
                        using (SqlCommand command = new SqlCommand(@"
                            DELETE img 
                            FROM ItemImages img
                            JOIN Items i ON img.item_id = i.item_id
                            WHERE i.list_id = @listId", connection, transaction))
                        {
                            command.Parameters.AddWithValue("@listId", id);
                            await command.ExecuteNonQueryAsync();
                        }
                        
                        // Delete all variants
                        using (SqlCommand command = new SqlCommand(
                            "DELETE FROM Items WHERE list_id = @listId", connection, transaction))
                        {
                            command.Parameters.AddWithValue("@listId", id);
                            await command.ExecuteNonQueryAsync();
                        }
                        
                        // Delete the listing
                        using (SqlCommand command = new SqlCommand(
                            "DELETE FROM Listing WHERE list_id = @listId", connection, transaction))
                        {
                            command.Parameters.AddWithValue("@listId", id);
                            await command.ExecuteNonQueryAsync();
                        }
                        
                        // Commit the transaction
                        transaction.Commit();
                        
                        return Ok(new { message = "Product deleted successfully" });
                    }
                    catch (Exception ex)
                    {
                        // Rollback on error
                        transaction.Rollback();
                        return StatusCode(500, $"An error occurred while deleting the product: {ex.Message}");
                    }
                }
            }
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


        private int GetCurrentStoreId()
        {
            // This retrieves the current store's ID from the authenticated user's claims
            var storeIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst("storeId");
            int.TryParse(storeIdClaim?.Value, out int storeId);
            return storeId;
        }

        private int GetCurrentUserId()
        {
            // This retrieves the current user's ID from the authenticated user's claims
            var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier);
            int.TryParse(userIdClaim?.Value, out int userId);
            return userId;
        }




    }

    public class ProductCreateRequest
    {
        public int StoreId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int CategoryId { get; set; }
        public DateTime? AvailFrom { get; set; }
        public DateTime? AvailTo { get; set; }
        public List<ProductVariantRequest> Variants { get; set; }
    }

    public class ProductUpdateRequest
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public int CategoryId { get; set; }
        public DateTime? AvailFrom { get; set; }
        public DateTime? AvailTo { get; set; }
        public List<ProductVariantRequest> Variants { get; set; }
        public List<int> DeletedVariantIds { get; set; }

        
    }

    public class ProductVariantRequest
    {
        public int ItemId { get; set; } // 0 for new variants, > 0 for existing variants
        public decimal Price { get; set; }
        public decimal SalePrice { get; set; }
        public string Type { get; set; }
        public string Size { get; set; }
        public string Colour { get; set; }
        public int Quantity { get; set; }
        public List<string> Images { get; set; }
    }
}