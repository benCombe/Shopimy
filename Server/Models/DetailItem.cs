using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace Server.Models
{
    public class DetailItem{
        //[Key]
        //[Column("list_id")]
        public int ListId {get; set;}
        //[Column("store_id")]
        public int StoreId {get; set;}
        //[Column("item_id")]
        public int ItemId {get; set;}
        //[Column("name")]
        public string Name {get; set;}
        //[Column("price")]
        public decimal Price {get; set;}
        //[Column("sale_price")]
        public decimal SalePrice {get; set;}
        //[Column("quantity")]
        public int Quantity {get; set;}
         //[Column("availFrom")]
        public string? AvailFrom {get; set;}
         //[Column("availTo")]
        public string? AvailTo {get; set;}
         //[Column("blob")]
        public string Blob {get; set;}
        //[Column("category")]
        public int CategoryId {get; set;}
        //[Column("colour")]
        public string? Colour {get; set;}
        //[Column("size")]
        public string? Size {get; set;}
        //[Column("currentRating")]
        public int? CurrentRating {get; set;}
        //[Column("type")]
        public string? Type {get; set;}
        //[Column("description")]
        public string? Description {get; set;}

    }
}