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