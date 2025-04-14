using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Server.Data;
using Server.Models;
using Shopimy.Server.Models;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StoreController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly BlobServiceClient _blobServiceClient;
        private readonly string _containerName = "storeimages";

        public StoreController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
            string connectionString = _configuration.GetConnectionString("AzureBlobStorage");
            _blobServiceClient = new BlobServiceClient(connectionString);
        }

        [HttpGet("{url}")]
        [AllowAnonymous]
        public async Task<ActionResult<StoreDetails>> GetStoreDetails(string url)
        {
            var store = await _context.Stores
                .Where(s => s.StoreUrl == url)
                .FirstOrDefaultAsync();

            if (store == null)
            {
                return NotFound("Store not found.");
            }

            var themes = await _context.StoreThemes
                .Where(s => s.StoreId == store.StoreId)
                .FirstOrDefaultAsync();

            if (themes == null)
            {
                return NotFound("Themes not found.");
            }

            var categories = await _context.Categories
                .Where(c => c.StoreId == store.StoreId)
                .ToListAsync();
            
            StoreDetails storeDetails = new StoreDetails(
                store.StoreId,
                store.StoreUrl,
                store.Name,
                themes.Theme_1,
                themes.Theme_2,
                themes.Theme_3,
                themes.FontColor,
                themes.FontFamily,
                themes.BannerText,
                themes.LogoText,
                categories
            );

            return Ok(storeDetails);
        }

        [HttpPost("upload")]
        [Authorize]
        public async Task<IActionResult> UploadStoreDetails([FromBody] StoreDetails storeDetails)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var existingStore = await _context.Stores
                    .FirstOrDefaultAsync(s => s.StoreUrl == storeDetails.URL);

                Store store;
                bool isNewStore = false;

                if (existingStore == null)
                {
                    store = new Store
                    {
                        StoreUrl = storeDetails.URL,
                        Name = storeDetails.Name
                    };
                    _context.Stores.Add(store);
                    await _context.SaveChangesAsync();
                    isNewStore = true;
                }
                else
                {
                    store = existingStore;
                    store.Name = storeDetails.Name;
                    _context.Stores.Update(store);
                    await _context.SaveChangesAsync();
                }

                var existingTheme = await _context.StoreThemes
                    .FirstOrDefaultAsync(st => st.StoreId == store.StoreId);

                if (existingTheme == null)
                {
                    var storeTheme = new StoreTheme
                    {
                        StoreId = store.StoreId,
                        Theme_1 = storeDetails.Theme_1,
                        Theme_2 = storeDetails.Theme_2,
                        Theme_3 = storeDetails.Theme_3,
                        FontColor = storeDetails.FontColor,
                        FontFamily = storeDetails.FontFamily,
                        BannerText = storeDetails.BannerText,
                        LogoText = storeDetails.LogoText
                    };
                    _context.StoreThemes.Add(storeTheme);
                }
                else
                {
                    existingTheme.Theme_1 = storeDetails.Theme_1;
                    existingTheme.Theme_2 = storeDetails.Theme_2;
                    existingTheme.Theme_3 = storeDetails.Theme_3;
                    existingTheme.FontColor = storeDetails.FontColor;
                    existingTheme.FontFamily = storeDetails.FontFamily;
                    existingTheme.BannerText = storeDetails.BannerText;
                    existingTheme.LogoText = storeDetails.LogoText;
                    _context.StoreThemes.Update(existingTheme);
                }

                if (storeDetails.Categories != null && storeDetails.Categories.Any())
                {
                    var existingCategories = await _context.Categories
                        .Where(c => c.StoreId == store.StoreId)
                        .ToListAsync();
                    
                    if (existingCategories.Any())
                    {
                        _context.Categories.RemoveRange(existingCategories);
                    }

                    foreach (var category in storeDetails.Categories)
                    {
                        category.StoreId = store.StoreId;
                        _context.Categories.Add(category);
                    }
                }

                await _context.SaveChangesAsync();

                return Ok(new { 
                    success = true, 
                    message = isNewStore ? "Store created successfully" : "Store updated successfully",
                    storeId = store.StoreId
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Error saving store details: {ex.Message}" });
            }
        }

        [HttpPost("upload-image")]
        [Authorize]
        public async Task<IActionResult> UploadImage(IFormFile file, [FromQuery] int storeId, [FromQuery] string imageType)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File is empty or not provided");

            string[] permittedExtensions = { ".jpg", ".jpeg", ".png", ".gif" };
            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            
            if (string.IsNullOrEmpty(ext) || !permittedExtensions.Contains(ext))
                return BadRequest("Invalid file type. Allowed types: jpg, jpeg, png, gif.");

            if (file.Length > 5 * 1024 * 1024)
                return BadRequest("File size exceeds the limit of 5MB.");

            try
            {
                BlobContainerClient containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
                await containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob);

                var uniqueFileName = $"{storeId}/{imageType}_{Guid.NewGuid()}{ext}";
                BlobClient blobClient = containerClient.GetBlobClient(uniqueFileName);

                using (var stream = file.OpenReadStream())
                {
                    await blobClient.UploadAsync(stream, new BlobHttpHeaders { ContentType = file.ContentType });
                }

                string blobUrl = blobClient.Uri.ToString();

                var store = await _context.StoreThemes.FirstOrDefaultAsync(s => s.StoreId == storeId);
                
                if (store != null)
                {                    
                    switch (imageType.ToLower())
                    {
                        case "banner":
                            store.BannerImagePath = blobUrl;
                            break;
                        case "logo":
                            store.LogoImagePath = blobUrl;
                            break;
                    }
                    
                    _context.StoreThemes.Update(store);
                    await _context.SaveChangesAsync();
                }

                return Ok(new { 
                    success = true, 
                    message = "Image uploaded successfully", 
                    filePath = blobUrl 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Error uploading image: {ex.Message}" });
            }
        }
    }
}