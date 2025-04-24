using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace Server.Models
{
    public class Quantity{
        public required string Name {get; set;}
        public int TotalQuantity {get; set;}
    }
}