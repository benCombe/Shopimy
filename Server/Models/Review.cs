using System;

namespace Server.Models
{
    public class Review
    {
        public int Id { get; set; }
        public int ProductId { get; set; } // Foreign key for Product
        public required string UserId { get; set; } // Foreign key for User (assuming string ID)
        public int Rating { get; set; } // e.g., 1-5 stars
        public required string Comment { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation properties (optional but recommended)
        // public Product Product { get; set; }
        // public ApplicationUser User { get; set; }
    }
} 