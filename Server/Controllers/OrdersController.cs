using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using System.Data;
using System.Dynamic;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public OrdersController(AppDbContext context, IConfiguration configuration, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
        }

        // GET: api/orders
        [HttpGet]
        public async Task<IActionResult> GetOrders()
        {
            // Get the current store ID and user ID from the authenticated user
            int storeId = GetCurrentStoreId();
            if (storeId <= 0)
            {
                return Unauthorized("Store ID not found in claims or invalid");
            }

            // Use raw SQL to join Orders with OrderItems and get customer info
            string? connectionString = _configuration.GetConnectionString("DefaultConnection");
            if (string.IsNullOrEmpty(connectionString))
            {
                return StatusCode(500, "Database connection not configured");
            }

            var orders = new List<dynamic>();

            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                await connection.OpenAsync();
                string query = @"
                    SELECT o.order_id, o.order_date, o.total_amount, o.status,
                           o.shipping_address, o.payment_method, u.first_name, u.last_name
                    FROM Orders o
                    JOIN Users u ON o.user_id = u.id
                    WHERE o.store_id = @storeId
                    ORDER BY o.order_date DESC";

                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@storeId", storeId);
                    
                    using (SqlDataReader reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            string customerName = $"{reader["first_name"]} {reader["last_name"]}";
                            int orderId = reader.GetInt32(reader.GetOrdinal("order_id"));
                            
                            dynamic order = new ExpandoObject();
                            order.orderId = orderId;
                            order.orderDate = reader.GetDateTime(reader.GetOrdinal("order_date"));
                            order.customerName = customerName;
                            order.totalAmount = reader.GetDecimal(reader.GetOrdinal("total_amount"));
                            order.status = reader.GetString(reader.GetOrdinal("status")) ?? string.Empty;
                            order.shippingAddress = !reader.IsDBNull(reader.GetOrdinal("shipping_address")) 
                                ? reader.GetString(reader.GetOrdinal("shipping_address")) 
                                : null;
                            order.paymentMethod = !reader.IsDBNull(reader.GetOrdinal("payment_method")) 
                                ? reader.GetString(reader.GetOrdinal("payment_method")) 
                                : null;
                            order.items = new List<dynamic>();
                            
                            orders.Add(order);
                        }
                    }
                }

                // Get the order items for each order
                foreach (dynamic order in orders)
                {
                    int orderId = order.orderId;
                    string itemsQuery = @"
                        SELECT oi.item_id, oi.quantity, oi.price_paid, l.name, img.blob as image_url
                        FROM OrderItems oi
                        JOIN Items i ON oi.item_id = i.item_id
                        JOIN Listing l ON i.list_id = l.list_id
                        LEFT JOIN ItemImages img ON img.item_id = i.item_id AND img.item_index = 0
                        WHERE oi.order_id = @orderId";

                    var orderItems = new List<dynamic>();
                    
                    using (SqlCommand itemsCommand = new SqlCommand(itemsQuery, connection))
                    {
                        itemsCommand.Parameters.AddWithValue("@orderId", orderId);
                        
                        using (SqlDataReader itemsReader = await itemsCommand.ExecuteReaderAsync())
                        {
                            while (await itemsReader.ReadAsync())
                            {
                                dynamic item = new ExpandoObject();
                                item.itemId = itemsReader.GetInt32(itemsReader.GetOrdinal("item_id"));
                                item.name = itemsReader.GetString(itemsReader.GetOrdinal("name"));
                                item.quantity = itemsReader.GetInt32(itemsReader.GetOrdinal("quantity"));
                                item.price = itemsReader.GetDecimal(itemsReader.GetOrdinal("price_paid"));
                                
                                // Handle potentially null imageUrl
                                int imageUrlOrdinal = itemsReader.GetOrdinal("image_url");
                                item.imageUrl = !itemsReader.IsDBNull(imageUrlOrdinal) ? itemsReader.GetString(imageUrlOrdinal) : (string?)null;
                                    
                                orderItems.Add(item);
                            }
                        }
                    }

                    // Add the items to the order
                    order.items = orderItems;
                }
            }

            return Ok(orders);
        }

        // GET: api/orders/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrderById(int id)
        {
            int storeId = GetCurrentStoreId();
            if (storeId <= 0)
            {
                return Unauthorized("Store ID not found in claims or invalid");
            }

            string? connectionString = _configuration.GetConnectionString("DefaultConnection");
            if (string.IsNullOrEmpty(connectionString))
            {
                return StatusCode(500, "Database connection not configured");
            }

            dynamic? order = null;

            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                await connection.OpenAsync();
                string query = @"
                    SELECT o.order_id, o.order_date, o.total_amount, o.status,
                           o.shipping_address, o.payment_method, u.first_name, u.last_name
                    FROM Orders o
                    JOIN Users u ON o.user_id = u.id
                    WHERE o.order_id = @orderId AND o.store_id = @storeId";

                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@orderId", id);
                    command.Parameters.AddWithValue("@storeId", storeId);
                    
                    using (SqlDataReader reader = await command.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            string customerName = $"{reader["first_name"]} {reader["last_name"]}";
                            
                            order = new ExpandoObject();
                            order.orderId = id;
                            order.orderDate = reader.GetDateTime(reader.GetOrdinal("order_date"));
                            order.customerName = customerName;
                            order.totalAmount = reader.GetDecimal(reader.GetOrdinal("total_amount"));
                            order.status = reader.GetString(reader.GetOrdinal("status")) ?? string.Empty;
                            order.shippingAddress = !reader.IsDBNull(reader.GetOrdinal("shipping_address")) 
                                ? reader.GetString(reader.GetOrdinal("shipping_address")) 
                                : null;
                            order.paymentMethod = !reader.IsDBNull(reader.GetOrdinal("payment_method")) 
                                ? reader.GetString(reader.GetOrdinal("payment_method")) 
                                : null;
                            order.items = new List<dynamic>();
                        }
                        else
                        {
                            return NotFound();
                        }
                    }

                    if (order != null)
                    {
                        // Get the order items
                        string itemsQuery = @"
                            SELECT oi.item_id, oi.quantity, oi.price_paid, l.name, img.blob as image_url
                            FROM OrderItems oi
                            JOIN Items i ON oi.item_id = i.item_id
                            JOIN Listing l ON i.list_id = l.list_id
                            LEFT JOIN ItemImages img ON img.item_id = i.item_id AND img.item_index = 0
                            WHERE oi.order_id = @orderId";

                        using (SqlCommand itemsCommand = new SqlCommand(itemsQuery, connection))
                        {
                            itemsCommand.Parameters.AddWithValue("@orderId", id);
                            
                            using (SqlDataReader itemsReader = await itemsCommand.ExecuteReaderAsync())
                            {
                                var items = new List<dynamic>();
                                while (await itemsReader.ReadAsync())
                                {
                                    dynamic item = new ExpandoObject();
                                    item.itemId = itemsReader.GetInt32(itemsReader.GetOrdinal("item_id"));
                                    item.name = itemsReader.GetString(itemsReader.GetOrdinal("name"));
                                    item.quantity = itemsReader.GetInt32(itemsReader.GetOrdinal("quantity"));
                                    item.price = itemsReader.GetDecimal(itemsReader.GetOrdinal("price_paid"));
                                    
                                    // Handle potentially null imageUrl
                                    int imageUrlOrdinal = itemsReader.GetOrdinal("image_url");
                                    item.imageUrl = !itemsReader.IsDBNull(imageUrlOrdinal) ? itemsReader.GetString(imageUrlOrdinal) : (string?)null;
                                        
                                    items.Add(item);
                                }
                                order.items = items;
                            }
                        }
                    }
                }
            }

            return Ok(order);
        }

        // PATCH: api/orders/{id}
        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusRequest request)
        {
            int storeId = GetCurrentStoreId();
            if (storeId <= 0)
            {
                return Unauthorized("Store ID not found in claims or invalid");
            }

            // Validate the status
            var validStatuses = new[] { "Pending", "Processing", "Shipped", "Delivered", "Cancelled" };
            if (!validStatuses.Contains(request.Status))
            {
                return BadRequest($"Status must be one of: {string.Join(", ", validStatuses)}");
            }

            string? connectionString = _configuration.GetConnectionString("DefaultConnection");
            if (string.IsNullOrEmpty(connectionString))
            {
                return StatusCode(500, "Database connection not configured");
            }

            try
            {
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    await connection.OpenAsync();
                    string query = @"
                        UPDATE Orders
                        SET status = @status
                        WHERE order_id = @orderId AND store_id = @storeId";

                    using (SqlCommand command = new SqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@status", request.Status);
                        command.Parameters.AddWithValue("@orderId", id);
                        command.Parameters.AddWithValue("@storeId", storeId);
                        
                        int rowsAffected = await command.ExecuteNonQueryAsync();
                        if (rowsAffected == 0)
                        {
                            return NotFound();
                        }

                        return Ok(new { success = true, message = "Status updated successfully" });
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        private int GetCurrentStoreId()
        {
            // This retrieves the current store's ID from the authenticated user's claims
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null) return 0;

            var user = httpContext.User;
            if (user == null) return 0;

            var storeIdClaim = user.FindFirst("storeId");
            if (storeIdClaim == null || !int.TryParse(storeIdClaim.Value, out int storeId))
            {
                return 0;
            }

            return storeId;
        }
    }

    public class UpdateOrderStatusRequest
    {
        public required string Status { get; set; }
    }
} 