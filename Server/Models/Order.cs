using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models // Assuming Server.Models is the correct namespace
{
    public class Order
    {
        [Key]
        public int Id { get; set; }
        public string? StripeSessionId { get; set; } // Link to Stripe session
        public string Status { get; set; } = "Pending"; // e.g., Pending, Paid, Failed, Processing, Shipped, Cancelled
        public decimal TotalAmount { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int StoreId { get; set; } // Link back to the store
        public int UserId { get; set; } // Foreign key to the User table
        [ForeignKey("UserId")]
        public virtual User? User { get; set; } // Navigation property to the User
        public string? Notes { get; set; } // Added for storing notes like payment failure reasons
        // Add other relevant fields: UserId, ShippingAddress, BillingAddress, etc.

        // Navigation property for related OrderItems
        public virtual List<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
} 