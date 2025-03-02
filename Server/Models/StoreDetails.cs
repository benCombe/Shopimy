using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models
{
    /* public class Store
    {
        [Key]
        [Column("store_id")]
        public string Id {get; set;}
        [Column("store_url")]
        public string URL {get;set;}        
        [Column("name")]
        public string Name {get; set;}
        [Column()]
    } */


    public class StoreDetails{
        public int Id {get; set;}
        public string URL {get;set;} 
        public string Name {get; set;} 
        public string Theme_1 {get; set;}
        public string Theme_2 {get; set;}
        public string Theme_3 {get; set;}
        public string FontFamily {get; set;}
        public string FontColor {get; set;}
        public string BannerText {get; set;}
        public string LogoText {get; set;}
    }
}