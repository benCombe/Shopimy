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
        public string Theme_1 {get; set;} = string.Empty;
        [Column("theme_colour2")]
        public string Theme_2 {get; set;} = string.Empty;
        [Column("theme_colour3")]
        public string Theme_3 {get; set;} = string.Empty;
        [Column("font_colour")]
        public string FontColor {get; set;} = string.Empty;
        [Column("font_family")]
        public string FontFamily {get; set;} = string.Empty;
        [Column("banner_text")]
        public string BannerText {get; set;} = string.Empty;
        [Column("logo_text")]
        public string LogoText {get; set;} = string.Empty;
        [Column("component_visibility")]
        public string ComponentVisibility {get; set;} = string.Empty;
    }
}