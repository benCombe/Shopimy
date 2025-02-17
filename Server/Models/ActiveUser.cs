using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace Server.Models
{
    public class ActiveUser
    {
        [Key]
        [Column("user_id")]
        
        public int UserId { get; set; }
        [Column("login_date")]
        public DateTime LoginDate { get; set; }
        
        [Required]
        [Column("token")]
        public string Token { get; set; }
    }
}
