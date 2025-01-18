public class Item
{
    public string Name { get; set; }
    public string Id { get; set; }
    
    public decimal OriginalPrice { get; set; }
    public decimal? SalePrice { get; set; }
    public bool OnSale { get; set; }

    public string Description { get; set; }
    public int QuantityInStock { get; set; }
    
    public DateTime AvailFrom { get; set; }
    public DateTime AvailTo { get; set; }
    
    public decimal CurrentRating { get; private set; } // Decimal value between 0 and 5

    public Item(
        string name, 
        string id, 
        decimal originalPrice, 
        string description, 
        int quantityInStock, 
        DateTime availFrom, 
        DateTime availTo, 
        decimal? salePrice = null,
        decimal currentRating = 0 // Default rating of 0
    )
    {
        Name = name;
        Id = id;
        OriginalPrice = originalPrice;
        Description = description;
        QuantityInStock = quantityInStock;
        AvailFrom = availFrom;
        AvailTo = availTo;
        SalePrice = salePrice;
        OnSale = salePrice.HasValue && salePrice < originalPrice;
        CurrentRating = ValidateRating(currentRating);
    }

    private decimal ValidateRating(decimal rating)
    {
        return Math.Clamp(rating, 0, 5); // Ensure rating is within 0-5
    }
}
