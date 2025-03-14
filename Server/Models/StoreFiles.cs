using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Shopimy.Server.Models;

namespace Server.Models
{
    public class StoreBanner{

        [Key]
        [Column("store_id")]
        public int StoreID {get; set;}
        [Column("banner_url")]
        public string BannerURL {get; set;}
    }

    public class StoreLogo{

        [Key]
        [Column("store_id")]
        public int StoreID {get; set;}
        [Column("logo_url")]
        public string LogoURL {get; set;}
    }
}