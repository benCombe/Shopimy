using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shopimy.Server.Models
{

    public class Category
    {   
        [Key]
        [Column("category_id")]
        public int CategoryId { get; set; }
        [Column("store_id")]
        public int StoreId { get; set; }
        [Column("name")]
        public required string Name { get; set; }
        [Column("parent_category")]
        public int? ParentCategory { get; set; } // for nested categories


        // Lightweight models for create/update operations:
       /*  public class CreateCategory
        {
            public string Name { get; set; }
            public int? ParentCategory { get; set; }
        }
        

        public class UpdateCategory
        {
            public string Name { get; set; }
            public int? ParentCategory { get; set; }
        }
         */

        // Navigation properties can be added if using EF Core:
        //public virtual Category Parent { get; set; }
        //public virtual ICollection<Category> SubCategories { get; set; }
        //public virtual ICollection<ProductCategory> ProductCategories { get; set; }
    }
}
