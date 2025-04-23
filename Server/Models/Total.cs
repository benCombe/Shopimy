using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace Server.Models
{
    public class Total{
        public string Name {get; set;}
        public decimal TotalPrice {get; set;}
    }
}