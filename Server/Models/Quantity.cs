using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace Server.Models
{
    public class Quantity{
        public string Name {get; set;}
        public int TotalQuantity {get; set;}
    }
}