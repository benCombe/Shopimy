using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Shopimy.Server.Models;
using System.Collections.Generic;

namespace Server.Models
{
    public class StoreDetails{
        public int Id {get; set;}
        public string URL {get;set;} = string.Empty;
        public string Name {get; set;} = string.Empty;
        public string Theme_1 {get; set;} = string.Empty;
        public string Theme_2 {get; set;} = string.Empty;
        public string Theme_3 {get; set;} = string.Empty;
        public string FontColor {get; set;} = string.Empty;
        public string FontFamily {get; set;} = string.Empty;
        public string BannerText {get; set;} = string.Empty;
        public string LogoText {get; set;} = string.Empty;
        public string BannerURL {get; set;} = string.Empty;
        public string LogoURL {get; set;} = string.Empty;
        public List<Category> Categories { get; set; } = new List<Category>();

        public StoreDetails() { 
            URL = string.Empty;
            Name = string.Empty;
            Theme_1 = string.Empty;
            Theme_2 = string.Empty;
            Theme_3 = string.Empty;
            FontColor = string.Empty;
            FontFamily = string.Empty;
            BannerText = string.Empty;
            LogoText = string.Empty;
            BannerURL = string.Empty;
            LogoURL = string.Empty;
            Categories = new List<Category>();
        }

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
            string BannerURL,
            string LogoURL,
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
            this.BannerURL = BannerURL;
            this.LogoURL = LogoURL;
            this.Categories = Categories ?? new List<Category>();
        }
    }
}