namespace Server.Models
{
    public class RegistrationDetails
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Address { get; set; }

        public string Country {get; set; }
        public DateTime DOB {get; set;}
        public string Password { get; set; }

        public bool Subscribed {get; set; }

        
    }
}
