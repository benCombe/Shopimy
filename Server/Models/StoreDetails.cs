using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Shopimy.Server.Models;
using System.Collections.Generic;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using System.Text.Json;

namespace Server.Models
{
    /* public class Store
    {
        [Key]
        [Column("store_id")]
        public string Id {get; set;}
        [Column("store_url")]
        public string URL {get;set;}        
        [Column("name")]
        public string Name {get; set;}
        [Column()]
    } */


    public class StoreDetails : IValidatableObject
    {
        public int Id {get; set;}

        [Required(ErrorMessage = "Store URL is required.")]
        [StringLength(100, ErrorMessage = "Store URL cannot be longer than 100 characters.")]
        [RegularExpression(@"^[a-zA-Z0-9\-]+$", ErrorMessage = "Store URL can only contain letters, numbers, and hyphens.")]
        public string URL {get;set;} = string.Empty;

        [Required(ErrorMessage = "Store name is required.")]
        [StringLength(100, ErrorMessage = "Store name cannot be longer than 100 characters.")]
        public string Name {get; set;} = string.Empty;

        [Required(ErrorMessage = "Theme Color 1 is required.")]
        [RegularExpression(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", ErrorMessage = "Invalid hex color format for Theme Color 1.")]
        public string Theme_1 {get; set;} = "#393727"; // Default color

        [Required(ErrorMessage = "Theme Color 2 is required.")]
        [RegularExpression(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", ErrorMessage = "Invalid hex color format for Theme Color 2.")]
        public string Theme_2 {get; set;} = "#D0933D"; // Default color

        [Required(ErrorMessage = "Theme Color 3 is required.")]
        [RegularExpression(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", ErrorMessage = "Invalid hex color format for Theme Color 3.")]
        public string Theme_3 {get; set;} = "#D3CEBB"; // Default color

        [Required(ErrorMessage = "Font Color is required.")]
        [RegularExpression(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", ErrorMessage = "Invalid hex color format for Font Color.")]
        public string FontColor {get; set;} = "#FFFFFF"; // Default color

        [Required(ErrorMessage = "Font Family is required.")]
        [StringLength(200, ErrorMessage = "Font Family cannot be longer than 200 characters.")]
        public string FontFamily {get; set;} = "sans-serif"; // Default font

        [StringLength(50, ErrorMessage = "Banner Text cannot be longer than 50 characters.")]
        public string BannerText {get; set;} = string.Empty;

        [StringLength(50, ErrorMessage = "Logo Text cannot be longer than 50 characters.")]
        public string LogoText {get; set;} = string.Empty;

        [StringLength(200, ErrorMessage = "Banner URL cannot be longer than 200 characters.")]
        public string BannerURL {get; set;} = string.Empty;

        [StringLength(200, ErrorMessage = "Logo URL cannot be longer than 200 characters.")]
        public string LogoURL {get; set;} = string.Empty;

        // Categories are managed separately, no validation needed here directly
        public List<Category> Categories { get; set; } = new List<Category>();

        // Assuming ComponentVisibility is a JSON string, basic validation
        // More complex validation (e.g., valid JSON structure) might be needed
        [Required(ErrorMessage = "Component Visibility configuration is required.")]
        public string ComponentVisibility { get; set; } = string.Empty;

        // Default constructor used by model binding
        public StoreDetails() { 
            // Initialize with default values or leave empty if handled elsewhere
            URL = string.Empty;
            Name = string.Empty;
            Theme_1 = "#393727";
            Theme_2 = "#D0933D";
            Theme_3 = "#D3CEBB";
            FontColor = "#FFFFFF";
            FontFamily = "sans-serif";
            BannerText = "Welcome to our store";
            LogoText = string.Empty; // Let controller set default based on name
            BannerURL = string.Empty;
            LogoURL = string.Empty;
            Categories = new List<Category>();
            ComponentVisibility = "{}"; // Default to empty JSON object
        }

        // Constructor used for manually creating instances (e.g., in controller)
        public StoreDetails(
            int Id, 
            string URL, 
            string Name,
            string Theme_1,
            string Theme_2,
            string Theme_3,
            string FontColor,
            string FontFamily,
            string BannerText,
            string LogoText,
            string BannerURL,
            string LogoURL,
            List<Category> Categories,
            string ComponentVisibility = "{}"
        ){
            this.Id = Id;
            this.URL = URL;
            this.Name = Name;
            this.Theme_1 = Theme_1;
            this.Theme_2 = Theme_2;
            this.Theme_3 = Theme_3;
            this.FontColor = FontColor;
            this.FontFamily = FontFamily;
            this.BannerText = BannerText;
            this.LogoText = LogoText;
            this.BannerURL = BannerURL;
            this.LogoURL = LogoURL;
            this.Categories = Categories ?? new List<Category>();
            this.ComponentVisibility = ComponentVisibility;
        }

        // Custom validation for ComponentVisibility (example: check if valid JSON)
        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            // Only validate BannerURL/LogoURL if non-empty
            if (!string.IsNullOrWhiteSpace(BannerURL))
            {
                if (!Uri.IsWellFormedUriString(BannerURL, UriKind.Absolute))
                {
                    yield return new ValidationResult("Invalid URL format for Banner URL.", new[] { nameof(BannerURL) });
                }
            }
            if (!string.IsNullOrWhiteSpace(LogoURL))
            {
                if (!Uri.IsWellFormedUriString(LogoURL, UriKind.Absolute))
                {
                    yield return new ValidationResult("Invalid URL format for Logo URL.", new[] { nameof(LogoURL) });
                }
            }
            ValidationResult? jsonError = null;
            if (!string.IsNullOrWhiteSpace(ComponentVisibility))
            {
                try
                {
                    // Basic check: attempt to parse as a JsonDocument
                    using (JsonDocument.Parse(ComponentVisibility)) { }
                }
                catch (JsonException)
                {
                    jsonError = new ValidationResult("ComponentVisibility must be a valid JSON string.", new[] { nameof(ComponentVisibility) });
                }
            }
            if (jsonError != null)
            {
                yield return jsonError;
            }
            // Add other custom cross-field validation rules here if needed
        }
    }
}