using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Server.Data;
using Server.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

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
            // Check if email already exists
            if (await _context.Users.AnyAsync(u => u.Email == registration.Email))
            {
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
                Region = registration.Region,
                Password = hashedPassword,  // Store hashed password
                Verified = false // Default to not verified
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

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

            // Generate JWT token
            string token = GenerateJwtToken(user);

            // Insert into ActiveUsers table
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
                    user.Region,
                    user.Verified
                }
            });
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
                        u.Region,
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

        private string GenerateJwtToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
            };

            var token = new JwtSecurityToken(
                _configuration["Jwt:Issuer"],
                _configuration["Jwt:Issuer"],
                claims,
                expires: DateTime.UtcNow.AddHours(3),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
