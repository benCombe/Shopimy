using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System;
using System.Collections.Generic; // Keep this for List<OrderItem>

// DO NOT ADD TO CONTEXT -- User OrderItem and OrderLogEntry for database queries

namespace Server.Models // Assuming Server.Models is the correct namespace
{
    // Removed the older, conflicting Order class definition.
    // Keeping the second definition which matches the usage in PaymentController.

    public class Order
    {
        [Key]
        public int Id { get; set; }
        public string? StripeSessionId { get; set; } // Link to Stripe session
        public string? StripePaymentIntentId { get; set; } // Link to Stripe Payment Intent
        public string Status { get; set; } = "Pending"; // e.g., Pending, Paid, Failed, Processing, Shipped, Cancelled
        public decimal TotalAmount { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int StoreId { get; set; } // Link back to the store
        public int UserId { get; set; } // Foreign key to the User table
        [ForeignKey("UserId")]
        public virtual User? User { get; set; } // Navigation property to the User
        public string? Notes { get; set; } // Added for storing notes like payment failure reasons
        // Add other relevant fields: ShippingAddress, BillingAddress, etc.

        // Navigation property for related OrderItems
        public virtual List<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
} 