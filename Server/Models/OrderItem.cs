using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System;

//TODO ADD TO CONTEXT

namespace Server.Models
{
    public class OrderItem{
        [Key]
        [Column("order_id")]
        public int OrderId {get; set;}
        [Key]
        [Column("item_id")]
        public int ItemId {get; set;}
        [Column("quantity")]
        public int Quantity {get; set;}


        public OrderItem(
            int OrderId,
            int ItemId,
            int Quantity
        ){
            this.OrderId = OrderId;
            this.ItemId = ItemId;
            this.Quantity = Quantity;
        }


        public void setOrderId(int id){
            this.OrderId = id;
        }
    }
}