using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace Server.Models
{
    public class User
    {
        [Column("id")]
        public int Id { get; set; }
        [Column("first_name")]
        public string FirstName { get; set; }
        [Column("last_name")]
        public string LastName { get; set; }
        [Column("email")]
        public string Email { get; set; }
        [Column("phone")]
        public string Phone { get; set; }
        [Column("address")]
        public string Address { get; set; }
        [Column("country")]
        public string Country { get; set; }
        [Column("password")]
        public string Password { get; set; }
        [Column("verified")]
        public bool Verified { get; set; }
        [Column("subscribed")]

        public bool Subscribed {get; set;}
        [Column("dob")]

        public DateTime DOB {get; set;}
    }
}
