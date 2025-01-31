namespace Server.Models
{
    public class ActiveUser
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public DateTime LoginDate { get; set; }
        public string Token { get; set; }
    }
}
