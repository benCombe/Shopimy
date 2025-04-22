using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Server.Data;
using Server.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Data;
using Microsoft.Data.SqlClient;
using System.Dynamic;

namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    
    public class AccountController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AccountController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // POST: api/account/register
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<ActionResult<bool>> Register([FromBody] RegistrationDetails registration)
        {
            string json = JsonSerializer.Serialize(registration, new JsonSerializerOptions { WriteIndented = true });

            Console.WriteLine(json);
            // Check if email already exists
            if (await _context.Users.AnyAsync(u => u.Email == registration.Email))
            {
                Console.WriteLine("Bad Request Here");
                return BadRequest("Email already exists.");
            }

            // Hash the password with a salt
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(registration.Password, workFactor: 10);

            // Create a new user object
            var newUser = new User
            {
                FirstName = registration.FirstName,
                LastName = registration.LastName,
                Email = registration.Email,
                Phone = registration.Phone,
                Address = registration.Address,
                Country = registration.Country,
                Password = hashedPassword,  // Store hashed password
                Verified = false, // Default to not verified
                Subscribed = registration.Subscribed,
                DOB = registration.DOB
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();


            //Here is where to insert email validation using an email service

            return Ok(true);
        }

        // POST: api/account/login
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<object>> Login([FromBody] LoginDetails login)
        {
            // Find user by email
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == login.Email);
            if (user == null)
            {
                return Unauthorized("Invalid email or password.");
            }

            // Verify password
            if (!BCrypt.Net.BCrypt.Verify(login.Password, user.Password))
            {
                return Unauthorized("Invalid email or password.");
            }

            //Here is where to check if user email has been verified yet

            // Generate JWT token
            string token = GenerateJwtToken(user);

            // Check if user already has an active session and remove it
            var existingActiveUser = await _context.ActiveUsers.FirstOrDefaultAsync(au => au.UserId == user.Id);
            if (existingActiveUser != null)
            {
                _context.ActiveUsers.Remove(existingActiveUser);
                // Save changes immediately after removal to avoid potential conflicts
                // if SaveChangesAsync below fails for other reasons.
                await _context.SaveChangesAsync(); 
            }

            // Insert new record into ActiveUsers table
            var activeUser = new ActiveUser
            {
                UserId = user.Id,
                LoginDate = DateTime.UtcNow,
                Token = token
            };

            _context.ActiveUsers.Add(activeUser);
            await _context.SaveChangesAsync();

            // Return user data and token
            return Ok(new
            {
                Token = token,
                User = new
                {
                    user.Id,
                    user.FirstName,
                    user.LastName,
                    user.Email,
                    user.Phone,
                    user.Address,
                    user.Country,
                    user.Verified
                }
            });
        }

        // POST: api/account/logout
        [HttpPost("logout")]
        [AllowAnonymous] // Allows unauthenticated users to call this endpoint
        public async Task<IActionResult> Logout([FromBody] TokenRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.Token))
            {
                return BadRequest("Token is required.");
            }

            var activeUser = await _context.ActiveUsers.FirstOrDefaultAsync(u => u.Token == request.Token);
            
            if (activeUser == null)
            {
                return NotFound("Session not found or already logged out.");
            }

            _context.ActiveUsers.Remove(activeUser);
            await _context.SaveChangesAsync();

            return Ok(true);
        }


          // 🔐 Protected Endpoint: Get User Profile
        [HttpGet("profile")]
        [Authorize]  // Requires JWT authentication
        public async Task<ActionResult<object>> GetUserProfile()
        {
            try
            {
                // 🔹 Extract user ID from JWT token
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (userIdClaim == null)
                {
                    return Unauthorized("Invalid token. User ID not found.");
                }

                int userId = int.Parse(userIdClaim);

                // 🔹 Query database for user
                var user = await _context.Users
                    .Where(u => u.Id == userId)
                    .Select(u => new
                    {
                        u.Id,
                        u.FirstName,
                        u.LastName,
                        u.Email,
                        u.Phone,
                        u.Address,
                        u.Country,
                        u.Verified
                    })
                    .FirstOrDefaultAsync();

                if (user == null)
                {
                    return NotFound("User not found.");
                }

                // ✅ Return user details (excluding password)
                return Ok(user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // 🔐 Protected Endpoint: Update User Profile
        [HttpPut("profile")]
        [Authorize]  // Requires JWT authentication
        public async Task<ActionResult<bool>> UpdateUserProfile([FromBody] ProfileUpdateDTO profileUpdate)
        {
            try
            {
                // Extract user ID from JWT token claims
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userIdClaim == null)
                {
                    return Unauthorized("Invalid token. User ID not found.");
                }

                // Try to parse as integer, if not, try to find by email
                if (!int.TryParse(userIdClaim, out int userId))
                {
                    // If userIdClaim is not a valid integer, it might be an email
                    var userByEmail = await _context.Users.FirstOrDefaultAsync(u => u.Email == userIdClaim);
                    if (userByEmail == null)
                    {
                        return NotFound("User not found.");
                    }
                    userId = userByEmail.Id;
                }

                // Find the user in the database
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return NotFound("User not found.");
                }

                // Update the user's profile information
                // Note: Email and Password are NOT updated through this endpoint
                user.FirstName = profileUpdate.FirstName;
                user.LastName = profileUpdate.LastName;
                user.Phone = profileUpdate.Phone;
                user.Address = profileUpdate.Address;
                user.Country = profileUpdate.Country;
                
                // Additional fields
                if (!string.IsNullOrEmpty(profileUpdate.City))
                    user.City = profileUpdate.City;
                
                if (!string.IsNullOrEmpty(profileUpdate.State))
                    user.State = profileUpdate.State;
                
                if (!string.IsNullOrEmpty(profileUpdate.PostalCode))
                    user.PostalCode = profileUpdate.PostalCode;
                
                if (profileUpdate.DOB.HasValue)
                    user.DOB = profileUpdate.DOB.Value;
                
                // Update subscription status if provided
                if (profileUpdate.Subscribed.HasValue)
                    user.Subscribed = profileUpdate.Subscribed.Value;

                // Save the changes to the database
                await _context.SaveChangesAsync();

                return Ok(true);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // 🔐 Protected Endpoint: Get User Purchase History
        [HttpGet("purchase-history")]
        [Authorize]
        public async Task<ActionResult<PurchaseHistoryResponseDTO>> GetPurchaseHistory([FromQuery] int page = 1, [FromQuery] int itemsPerPage = 10)
        {
            try
            {
                // Extract user ID from JWT token
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userIdClaim == null)
                {
                    return Unauthorized("Invalid token. User ID not found.");
                }

                if (!int.TryParse(userIdClaim, out int userId))
                {
                    return BadRequest("Invalid user ID format.");
                }

                string? connectionString = _configuration.GetConnectionString("DefaultConnection");
                if (string.IsNullOrEmpty(connectionString))
                {
                    return StatusCode(500, "Database connection not configured");
                }

                var purchases = new List<OrderHistoryItemDTO>();
                int totalPurchases = 0;

                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    await connection.OpenAsync();

                    // First, get the total count for pagination
                    string countQuery = @"
                        SELECT COUNT(*) 
                        FROM Orders 
                        WHERE user_id = @userId";

                    using (SqlCommand countCommand = new SqlCommand(countQuery, connection))
                    {
                        countCommand.Parameters.AddWithValue("@userId", userId);
                        totalPurchases = (int)await countCommand.ExecuteScalarAsync();
                    }

                    // Then get the paginated orders with their store names
                    string ordersQuery = @"
                        SELECT o.order_id, o.order_date, o.total_amount, o.status, 
                               s.name AS store_name
                        FROM Orders o
                        JOIN Stores s ON o.store_id = s.store_id
                        WHERE o.user_id = @userId
                        ORDER BY o.order_date DESC
                        OFFSET @offset ROWS
                        FETCH NEXT @limit ROWS ONLY";

                    using (SqlCommand ordersCommand = new SqlCommand(ordersQuery, connection))
                    {
                        ordersCommand.Parameters.AddWithValue("@userId", userId);
                        ordersCommand.Parameters.AddWithValue("@offset", (page - 1) * itemsPerPage);
                        ordersCommand.Parameters.AddWithValue("@limit", itemsPerPage);

                        using (SqlDataReader ordersReader = await ordersCommand.ExecuteReaderAsync())
                        {
                            while (await ordersReader.ReadAsync())
                            {
                                int orderId = ordersReader.GetInt32(ordersReader.GetOrdinal("order_id"));
                                var order = new OrderHistoryItemDTO
                                {
                                    OrderId = orderId,
                                    OrderDate = ordersReader.GetDateTime(ordersReader.GetOrdinal("order_date")),
                                    StoreName = ordersReader.GetString(ordersReader.GetOrdinal("store_name")),
                                    TotalAmount = ordersReader.GetDecimal(ordersReader.GetOrdinal("total_amount")),
                                    Status = ordersReader.GetString(ordersReader.GetOrdinal("status")),
                                    Items = new List<OrderHistoryProductDTO>()
                                };

                                purchases.Add(order);
                            }
                        }
                    }

                    // Get items for each order
                    foreach (var order in purchases)
                    {
                        string itemsQuery = @"
                            SELECT oi.item_id, oi.product_name, oi.quantity, oi.price_paid
                            FROM OrderItems oi
                            WHERE oi.order_id = @orderId";

                        using (SqlCommand itemsCommand = new SqlCommand(itemsQuery, connection))
                        {
                            itemsCommand.Parameters.AddWithValue("@orderId", order.OrderId);

                            using (SqlDataReader itemsReader = await itemsCommand.ExecuteReaderAsync())
                            {
                                while (await itemsReader.ReadAsync())
                                {
                                    var item = new OrderHistoryProductDTO
                                    {
                                        ProductName = itemsReader.GetString(itemsReader.GetOrdinal("product_name")),
                                        Quantity = itemsReader.GetInt32(itemsReader.GetOrdinal("quantity")),
                                        PricePaid = itemsReader.GetDecimal(itemsReader.GetOrdinal("price_paid"))
                                    };

                                    order.Items.Add(item);
                                }
                            }
                        }
                    }
                }

                var response = new PurchaseHistoryResponseDTO
                {
                    Purchases = purchases,
                    Total = totalPurchases
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        private string GenerateJwtToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key is not configured")));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Make sure we're using the correct claim types and values
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()), // Use ID as subject
                new Claim(JwtRegisteredClaimNames.Email, user.Email ?? throw new InvalidOperationException("User email is null")), // Store email in a different claim
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()) // Ensure this is the user ID as string
            };

            var token = new JwtSecurityToken(
                _configuration["Jwt:Issuer"],
                _configuration["Jwt:Issuer"],
                claims,
                expires: DateTime.UtcNow.AddDays(3), // Expires after 3 days
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public class TokenRequest
        {
            public required string Token { get; set; }
        }
        
        public class ProfileUpdateDTO
        {
            public required string FirstName { get; set; }
            public required string LastName { get; set; }
            public required string Phone { get; set; }
            public required string Address { get; set; }
            public required string Country { get; set; }
            
            // Additional fields
            public string? City { get; set; }
            public string? State { get; set; }
            public string? PostalCode { get; set; }
            public DateTime? DOB { get; set; }
            public bool? Subscribed { get; set; }
        }

        public class PurchaseHistoryResponseDTO
        {
            public List<OrderHistoryItemDTO> Purchases { get; set; } = new List<OrderHistoryItemDTO>();
            public int Total { get; set; }
        }

        public class OrderHistoryItemDTO
        {
            public int OrderId { get; set; }
            public DateTime OrderDate { get; set; }
            public string StoreName { get; set; } = string.Empty;
            public decimal TotalAmount { get; set; }
            public string Status { get; set; } = string.Empty;
            public List<OrderHistoryProductDTO> Items { get; set; } = new List<OrderHistoryProductDTO>();
        }

        public class OrderHistoryProductDTO
        {
            public string ProductName { get; set; } = string.Empty;
            public int Quantity { get; set; }
            public decimal PricePaid { get; set; }
        }
    }
}