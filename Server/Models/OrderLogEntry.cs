using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System;

//TODO ADD TO CONTEXT

namespace Server.Models
{
    public class OrderLogEntry{
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("order_id")]
        public int OrderId {get; set;}
        [Column("store_id")]
        public int StoreId {get; set;}
        [Column("purchaser_id")]
        public int PurchaserId {get; set;}
        [Column("purchaser_email")]  
        public string? PurchaserEmail {get; set;}
        [Column("delivery_address")]
        public string? DeliveryAddress {get; set;}
        [Column("stripe_token")]
        public string? StripeToken {get; set;}
        [Column("order_date")]
        public DateTime? OrderDate {get; set;}
        [Column("order_status")]
        public string? OrderStatus {get; set;}
        [Column("total_amount")]
        public decimal? TotalAmount {get; set;}
        [Column("log_timestamp")]
        public DateTime? LogTimestamp {get; set;}

        public OrderLogEntry(
            int OrderId,
            int StoreId,
            int PurchaserId,
            string PurchaserEmail,
            string DeliveryAddress,
            string StripeToken,
            DateTime OrderDate,
            string OrderStatus

        ){
            this.OrderId = OrderId;
            this.StoreId = StoreId;
            this.PurchaserId = PurchaserId;
            this.PurchaserEmail = PurchaserEmail;
            this.DeliveryAddress = DeliveryAddress;
            this.StripeToken = StripeToken;
            this.OrderDate = OrderDate;
            this.OrderStatus = OrderStatus;
        }

        public OrderLogEntry(Order order)
        {
            OrderId = order.Id;
            StoreId = order.StoreId;
            PurchaserId = order.UserId;
            OrderDate = order.CreatedAt;
            OrderStatus = order.Status;
            TotalAmount = order.TotalAmount;
            LogTimestamp = DateTime.UtcNow;
        }
    }
}