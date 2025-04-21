using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models // Assuming Server.Models is the correct namespace
{
    public class OrderItem
    {
        [Key]
        public int Id { get; set; }
        public int OrderId { get; set; }

        // Foreign key navigation property back to Order
        [ForeignKey("OrderId")]
        public virtual Order? Order { get; set; }

        public int ProductId { get; set; } // Refers to your internal Product/Item ID
        public string ProductName { get; set; } = string.Empty; // Store name at time of order
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; } // Price at time of order
    }
} 