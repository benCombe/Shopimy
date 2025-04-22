using System.ComponentModel.DataAnnotations;

namespace Server.Models
{
    public class ThemeUpdateRequest
    {
        [Required(ErrorMessage = "Theme Color 1 is required.")]
        [RegularExpression(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", ErrorMessage = "Invalid hex color format for Theme Color 1.")]
        public string Theme_1 { get; set; } = "#393727";

        [Required(ErrorMessage = "Theme Color 2 is required.")]
        [RegularExpression(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", ErrorMessage = "Invalid hex color format for Theme Color 2.")]
        public string Theme_2 { get; set; } = "#D0933D";

        [Required(ErrorMessage = "Theme Color 3 is required.")]
        [RegularExpression(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", ErrorMessage = "Invalid hex color format for Theme Color 3.")]
        public string Theme_3 { get; set; } = "#D3CEBB";

        [Required(ErrorMessage = "Font Color is required.")]
        [RegularExpression(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", ErrorMessage = "Invalid hex color format for Font Color.")]
        public string FontColor { get; set; } = "#333333";

        [Required(ErrorMessage = "Font Family is required.")]
        [StringLength(200, ErrorMessage = "Font Family cannot be longer than 200 characters.")]
        public string FontFamily { get; set; } = "sans-serif";
    }
} 