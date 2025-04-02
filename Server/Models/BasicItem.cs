using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System;


namespace Server.Models
{
    public class BasicItem{
        [Key]
        [Column("list_id")]
        public int ListId {get; set;}
        [Column("store_id")]
        public int StoreId {get; set;}
        [Column("name")]
        public string Name {get; set;} = string.Empty;
        [Column("price")]
        public decimal Price {get; set;}
        [Column("sale_price")]
        public decimal SalePrice {get; set;}
        [Column("quantity")]
        public int quantity {get; set;}
         [Column("availFrom")]
        public DateTime? AvailFrom {get; set;}
         [Column("availTo")]
        public DateTime? AvailTo {get; set;}
         [Column("blob")]
        public string? Blob {get; set;}
        [Column("category")]
        public int CategoryId {get; set;}
    }
}