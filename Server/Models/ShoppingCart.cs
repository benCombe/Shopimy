using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class ShoppingCart
{
    public int CartId { get; set; }
    public int StoreId { get; set; }
    public int UserId { get; set; }
    public int ItemId { get; set; }
    public int Quantity { get; set; }
}
