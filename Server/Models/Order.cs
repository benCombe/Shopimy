using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System;

//DO NOT ADD TO CONTEXT -- User OrderItem and OrderLogEntry for database queries

namespace Server.Models
{
    public class Order{

        public int? OrderId {get; set;}
        public int StoreId {get; set;}
        public int PurchaserId {get; set;}
        public string? PurchaserEmail {get; set;}
        public string? DeliveryAddress {get; set;}
        public string? StripeToken {get; set;}
        public DateTime? OrderDate {get; set;}
        public string? OrderStatus {get; set;}
        public OrderItem[] Items {get; set;}

        public Order(
            int? OrderId,
            int StoreId,
            int PurchaserId,
            string PurchaserEmail,
            string DeliveryAddress,
            string StripeToken,
            DateTime OrderDate,
            string OrderStatus,
            OrderItem[] Items
        ){
            this.OrderId = OrderId;
            this.StoreId = StoreId;
            this.PurchaserId = PurchaserId;
            this.PurchaserEmail = PurchaserEmail;
            this.DeliveryAddress = DeliveryAddress;
            this.StripeToken = StripeToken;
            this.OrderDate = OrderDate;
            this.OrderStatus = OrderStatus;
            this.Items = Items;
        }
    }
}
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