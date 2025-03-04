using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Shopimy.Server.Models;

namespace Server.Models
{
    public class Store{
        [Key]
        [Column("store_id")]
        public int StoreId {get; set;}
        [Column("owner")]
        public int StoreOwnerId {get; set;}
        [Column("name")]
        public string Name {get; set;}  //max-length 50
        [Column("store_url")]
        public string StoreUrl {get; set;} //max-length 50
    }
}