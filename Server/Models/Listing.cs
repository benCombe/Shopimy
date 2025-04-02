using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace Server.Models
{
    public class Listing{
        [Key]
        [Column("list_id")]
        public int ListId {get; set;}
        [Column("store_id")]
        public int StoreId {get; set;}
        [Column("name")]
        public string Name {get; set;} = string.Empty;
        [Column("description")]
        public string Description {get; set;} = string.Empty;
        [Column("category")]
        public int CategoryId {get; set;}
    }
}