namespace Shopimy.Server.Models
{

public class Category
{
    public int CategoryId { get; set; }
    public int StoreId { get; set; }
    public required string Name { get; set; }
    public int? ParentCategory { get; set; } // for nested categories


    // Lightweight models for create/update operations:
    public class CreateCategory
    {
        public string Name { get; set; }
        public int? ParentCategory { get; set; }
    }
    

    public class UpdateCategory
    {
        public string Name { get; set; }
        public int? ParentCategory { get; set; }
    }


    // Navigation properties can be added if using EF Core:
    //public virtual Category Parent { get; set; }
    //public virtual ICollection<Category> SubCategories { get; set; }
    //public virtual ICollection<ProductCategory> ProductCategories { get; set; }
}
}
