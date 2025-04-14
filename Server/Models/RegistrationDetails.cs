using System;

namespace Server.Models
{
    public class RegistrationDetails
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Country {get; set; } = string.Empty;
        public DateTime? DOB {get; set;}
        public string Password { get; set; } = string.Empty;
        public bool Subscribed {get; set; }
    }
}
