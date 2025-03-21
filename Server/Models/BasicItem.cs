using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace Server.Models
{
    public class BasicItem{
        [Key]
        [Column("list_id")]
        public int ListId {get; set;}
        [Column("store_id")]
        public int StoreId {get; set;}
        [Column("name")]
        public string Name {get; set;}
        [Column("price")]
        public decimal Price {get; set;}
        [Column("sale_price")]
        public decimal SalePrice {get; set;}
        [Column("quantity")]
        public int quantity {get; set;}
         [Column("availFrom")]
        public string? AvailFrom {get; set;} //CHANGE TO DATE
         [Column("availTo")]
        public string? AvailTo {get; set;} //CHANGE TO DATE
         [Column("blob")]
        public string? Blob {get; set;} //url
        [Column("category")]
        public int CategoryId {get; set;}
    }
}