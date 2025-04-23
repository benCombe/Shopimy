using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models
{
    public class StoreVisit
    {
        [Key]
        [Column("visit_id")]
        public int VisitId { get; set; }

        [Required]
        [Column("store_id")]
        public int StoreId { get; set; }

        [Column("user_id")]
        public int? UserId { get; set; }  // Nullable for guest/unauthenticated visits

        [Column("visit_timestamp")]
        public DateTime VisitTimestamp { get; set; } = DateTime.UtcNow;

        // Navigation properties if needed
        [ForeignKey("StoreId")]
        public virtual Store? Store { get; set; }

        [ForeignKey("UserId")]
        public virtual User? User { get; set; }
    }
} 