using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models
{
    public class Promotion
    {
        [Key]
        public int PromotionId { get; set; }
        
        [Required]
        public int StoreId { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Code { get; set; } = string.Empty;
        
        [StringLength(255)]
        public string? Description { get; set; }
        
        [Required]
        [StringLength(20)]
        public string DiscountType { get; set; } = string.Empty; // "Percentage" or "FixedAmount"
        
        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal DiscountValue { get; set; }
        
        [Required]
        public DateTime StartDate { get; set; }
        
        public DateTime? EndDate { get; set; }
        
        [Required]
        public bool IsActive { get; set; } = true;
        
        public int? UsageLimit { get; set; }
    }
} 