using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Shopimy.Server.Models;

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
        public string FontColor {get; set;}
        public string FontFamily {get; set;}
        public string BannerText {get; set;}
        public string LogoText {get; set;}
       /*  public Category[] Categories { get; set; } */
        public List<Category> Categories { get; set; } //= new(); 

        public StoreDetails() { }

        public StoreDetails(
            int Id, 
            string URL, 
            string Name,
            string Theme_1,
            string Theme_2,
            string Theme_3,
            string FontColor,
            string FontFamily,
            string BannerText,
            string LogoText,
            List<Category> Categories
        ){
            this.Id = Id;
            this.URL = URL;
            this.Name = Name;
            this.Theme_1 = Theme_1;
            this.Theme_2 = Theme_2;
            this.Theme_3 = Theme_3;
            this.FontColor = FontColor;
            this.FontFamily = FontFamily;
            this.BannerText = BannerText;
            this.LogoText = LogoText;
            this.Categories = Categories;
        }
    }
}