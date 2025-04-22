using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace Server.Services
{
    public class LogoService
    {
        private readonly IWebHostEnvironment _environment;
        private const string LOGO_DIRECTORY = "images/logos";

        public LogoService(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        // Save a logo file to the server
        public async Task<string> SaveLogoFile(IFormFile file, int storeId)
        {
            // Ensure wwwroot directory exists
            if (!Directory.Exists(_environment.WebRootPath))
            {
                Directory.CreateDirectory(_environment.WebRootPath);
            }

            // Create the directory path if it doesn't exist
            string storeLogoDir = Path.Combine(_environment.WebRootPath, LOGO_DIRECTORY, storeId.ToString());
            Directory.CreateDirectory(storeLogoDir);

            // Generate a unique filename with the original extension
            string fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            string fileName = $"logo{fileExtension}";
            string filePath = Path.Combine(storeLogoDir, fileName);

            // Ensure any existing file is deleted first
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }

            // Save the file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Return the relative URL path (using forward slashes for URLs)
            return $"/{LOGO_DIRECTORY.Replace('\\', '/')}/{storeId}/{fileName}";
        }

        // Delete a logo file from the server
        public async Task DeleteLogoFile(string logoUrl)
        {
            if (string.IsNullOrEmpty(logoUrl))
            {
                return;
            }

            // Convert URL to file path
            string relativePath = logoUrl.TrimStart('/');
            string fullPath = Path.Combine(_environment.WebRootPath, relativePath);

            // Check if file exists before attempting to delete
            if (File.Exists(fullPath))
            {
                // Delete the file
                File.Delete(fullPath);
            }

            await Task.CompletedTask;
        }
    }
} 