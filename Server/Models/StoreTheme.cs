using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Shopimy.Server.Models;

namespace Server.Models
{
    public class StoreTheme{
        [Key]
        [Column("store_id")]
        public int StoreId {get; set;}
        [Column("theme_colour1")]
        public string Theme_1 {get; set;}  //max-length 7
        [Column("theme_colour2")]
        public string Theme_2 {get; set;}  //max-length 7
        [Column("theme_colour3")]
        public string Theme_3 {get; set;}  //max-length 7
        [Column("font_colour")]
        public string FontColor {get; set;}  //max-length 7
        [Column("font_family")]
        public string FontFamily {get; set;}  //max-length 100
        [Column("banner_text")]
        public string BannerText {get; set;} //max-length 50
        [Column("logo_text")]
        public string LogoText {get; set;} //max-length 50

        public string LogoImagePath { get; set; }
        public string BannerImagePath { get; set; }
    }
}