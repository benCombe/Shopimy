using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;
using Server.Services;
using System.Security.Claims;

namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LogoController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly LogoService _logoService;
        private readonly IWebHostEnvironment _environment;

        public LogoController(AppDbContext context, LogoService logoService, IWebHostEnvironment environment)
        {
            _context = context;
            _logoService = logoService;
            _environment = environment;
        }

        // Get current logo URL for the authenticated user's store
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<object>> GetLogo()
        {
            int userId = GetUserIdFromClaims();
            if (userId == 0)
            {
                return Unauthorized("Invalid user authentication token.");
            }

            var store = await GetStoreForUser(userId);
            if (store == null)
            {
                return NotFound("Store not found.");
            }

            var logo = await _context.StoreLogos
                .Where(l => l.StoreID == store.StoreId)
                .FirstOrDefaultAsync();

            return Ok(new { logoUrl = logo?.LogoURL ?? "" });
        }

        // Upload a new logo for the authenticated user's store
        [HttpPost("upload")]
        [Authorize]
        public async Task<ActionResult<object>> UploadLogo([FromForm] IFormFile logo)
        {
            try
            {
                int userId = GetUserIdFromClaims();
                if (userId == 0)
                {
                    return Unauthorized("Invalid user authentication token.");
                }

                var store = await GetStoreForUser(userId);
                if (store == null)
                {
                    return NotFound("Store not found.");
                }

                if (logo == null || logo.Length == 0)
                {
                    return BadRequest("No file uploaded.");
                }

                // Validate file type
                var allowedTypes = new[] { "image/jpeg", "image/png", "image/gif" };
                if (!allowedTypes.Contains(logo.ContentType.ToLower()))
                {
                    return BadRequest("File type not allowed. Please upload a JPEG, PNG, or GIF file.");
                }

                // Validate file size (e.g., max 5MB)
                const int maxSizeInBytes = 5 * 1024 * 1024; // 5MB
                if (logo.Length > maxSizeInBytes)
                {
                    return BadRequest("File size exceeds the maximum allowed (5MB).");
                }

                // Upload the logo file and get the URL
                Console.WriteLine($"Uploading logo for store ID: {store.StoreId}");
                Console.WriteLine($"Web root path: {_environment.WebRootPath}");
                
                string logoUrl = await _logoService.SaveLogoFile(logo, store.StoreId);
                Console.WriteLine($"Logo saved successfully. URL: {logoUrl}");

                // Save or update the logo URL in the database
                var existingLogo = await _context.StoreLogos
                    .Where(l => l.StoreID == store.StoreId)
                    .FirstOrDefaultAsync();

                if (existingLogo == null)
                {
                    // Create new logo entry
                    existingLogo = new StoreLogo
                    {
                        StoreID = store.StoreId,
                        LogoURL = logoUrl
                    };
                    _context.StoreLogos.Add(existingLogo);
                    Console.WriteLine("Created new logo entry in database");
                }
                else
                {
                    // Delete old logo file if it exists
                    if (!string.IsNullOrEmpty(existingLogo.LogoURL))
                    {
                        await _logoService.DeleteLogoFile(existingLogo.LogoURL);
                        Console.WriteLine($"Deleted previous logo: {existingLogo.LogoURL}");
                    }

                    // Update existing logo entry
                    existingLogo.LogoURL = logoUrl;
                    _context.StoreLogos.Update(existingLogo);
                    Console.WriteLine("Updated existing logo entry in database");
                }

                await _context.SaveChangesAsync();
                Console.WriteLine("Database updated successfully");

                return Ok(new { logoUrl });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error uploading logo: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, $"An error occurred while uploading the logo: {ex.Message}");
            }
        }

        // Delete the logo for the authenticated user's store
        [HttpDelete]
        [Authorize]
        public async Task<ActionResult<object>> DeleteLogo()
        {
            int userId = GetUserIdFromClaims();
            if (userId == 0)
            {
                return Unauthorized("Invalid user authentication token.");
            }

            var store = await GetStoreForUser(userId);
            if (store == null)
            {
                return NotFound("Store not found.");
            }

            var logo = await _context.StoreLogos
                .Where(l => l.StoreID == store.StoreId)
                .FirstOrDefaultAsync();

            if (logo == null || string.IsNullOrEmpty(logo.LogoURL))
            {
                return NotFound("No logo found to delete.");
            }

            try
            {
                // Delete the logo file
                await _logoService.DeleteLogoFile(logo.LogoURL);

                // Remove the logo entry from the database
                _context.StoreLogos.Remove(logo);
                await _context.SaveChangesAsync();

                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while deleting the logo: {ex.Message}");
            }
        }

        // Get raw logo file for the authenticated user's store
        [HttpGet("file")]
        [Authorize]
        public IActionResult GetLogoFile()
        {
            int userId = GetUserIdFromClaims();
            if (userId == 0)
            {
                return Unauthorized("Invalid authentication token.");
            }

            var store = _context.Stores
                .Where(s => s.StoreOwnerId == userId)
                .FirstOrDefault();
            if (store == null)
            {
                return NotFound("Store not found.");
            }

            var logoEntry = _context.StoreLogos
                .Where(l => l.StoreID == store.StoreId)
                .FirstOrDefault();
            if (logoEntry == null || string.IsNullOrEmpty(logoEntry.LogoURL))
            {
                return NotFound("No logo found.");
            }

            // Convert relative URL to file path
            var relativePath = logoEntry.LogoURL.TrimStart('/');
            var fullPath = Path.Combine(_environment.WebRootPath, relativePath);
            if (!System.IO.File.Exists(fullPath))
            {
                return NotFound("Logo file not found on server.");
            }

            // Determine content type
            var provider = new Microsoft.AspNetCore.StaticFiles.FileExtensionContentTypeProvider();
            if (!provider.TryGetContentType(fullPath, out var contentType))
            {
                contentType = "application/octet-stream";
            }

            return PhysicalFile(fullPath, contentType);
        }

        // Helper method to get user ID from claims
        private int GetUserIdFromClaims()
        {
            if (User == null)
            {
                return 0;
            }

            var nameIdentifierClaims = User.Claims.Where(c => c.Type == ClaimTypes.NameIdentifier).ToList();
            
            foreach (var claim in nameIdentifierClaims)
            {
                if (int.TryParse(claim.Value, out int parsedId) && parsedId > 0)
                {
                    return parsedId;
                }
            }
            
            return 0;
        }

        // Helper method to get store for user
        private async Task<Store?> GetStoreForUser(int userId)
        {
            return await _context.Stores
                .Where(s => s.StoreOwnerId == userId)
                .FirstOrDefaultAsync();
        }
    }
} 