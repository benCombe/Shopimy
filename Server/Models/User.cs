public class User
{
    public string Id { get; set; } 

    public string Type { get; set; }

    public string Password { get; set; }

    public string FirstName { get; set; }
    
    public string LastName { get; set; }    
    
    public string Email { get; set; }   

    public string Phone { get; set; }

    public string Address { get; set; }

    public string Region { get; set; }

    public bool Verified { get; set; }

    public string PaymentInfo { get; set; }

    public User(
        string id,
        string type,
        string password,
        string firstName,
        string lastName,
        string email,
        string phone,
        string address,
        string region,
        string paymentInfo,
        bool verified
    )
    {
        Id = id;
        Type = type;
        Password = password;
        FirstName = firstName;
        LastName = lastName;
        Email = email;
        Phone = phone;
        Address = address;
        Region = region;
        PaymentInfo = paymentInfo;
        Verified = verified;
    }
        

}