using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Requires authentication to upload
    public class ImageController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;

        public ImageController(IWebHostEnvironment env)
        {
            _env = env;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadImage([FromBody] ImageUploadRequest request)
        {
            if (string.IsNullOrEmpty(request.ImageData))
            {
                return BadRequest("Image data is required.");
            }

            try
            {
                // Extract base64 data (expected format: "data:image/jpeg;base64,/9j/...")
                var match = Regex.Match(request.ImageData, @"^data:image/(?<type>.+?);base64,(?<data>.+)$");
                if (!match.Success)
                {
                    return BadRequest("Invalid image data format.");
                }

                var imageType = match.Groups["type"].Value;
                var base64Data = match.Groups["data"].Value;
                var fileExtension = $".{imageType.ToLower()}";

                // Basic validation for allowed image types
                if (imageType != "jpeg" && imageType != "jpg" && imageType != "png" && imageType != "gif")
                {
                    return BadRequest("Invalid image type. Only jpeg, png, gif are allowed.");
                }

                var imageBytes = Convert.FromBase64String(base64Data);

                // Create a unique filename
                var fileName = $"{Guid.NewGuid()}{fileExtension}";

                // Define the path to save the image
                // Ensure wwwroot/images/products exists
                var uploadsFolderPath = Path.Combine(_env.WebRootPath ?? _env.ContentRootPath, "images", "products");
                if (!Directory.Exists(uploadsFolderPath))
                {
                    Directory.CreateDirectory(uploadsFolderPath);
                }
                var filePath = Path.Combine(uploadsFolderPath, fileName);

                // Save the image
                await System.IO.File.WriteAllBytesAsync(filePath, imageBytes);

                // Construct the URL to return
                // Assuming the app serves static files from wwwroot
                var imageUrl = $"/images/products/{fileName}"; 

                return Ok(new { imageUrl });
            }
            catch (FormatException)
            {
                return BadRequest("Invalid base64 image data.");
            }
            catch (Exception ex)
            {
                // Log the exception (implementation depends on logging setup)
                Console.WriteLine($"Error uploading image: {ex.Message}"); 
                return StatusCode(500, "An internal error occurred while uploading the image.");
            }
        }
    }

    // Re-use the existing model definition if appropriate, or define it here
    public class ImageUploadRequest
    {
        public required string ImageData { get; set; }
    }
} 