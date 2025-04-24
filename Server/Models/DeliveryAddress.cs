using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models
{
    [Table("DeliveryAddresses")]
    public class DeliveryAddress
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id")]
        public int Id { get; set; }

        [Column("user_id")]
        public int UserId { get; set; }

        [Column("address")]
        [Required]
        public string Address { get; set; } = string.Empty;

        [Column("city")]
        [Required]
        public string City { get; set; } = string.Empty;

        [Column("state")]
        [Required]
        public string State { get; set; } = string.Empty;

        [Column("country")]
        [Required]
        public string Country { get; set; } = string.Empty;

        [Column("postal_code")]
        [Required]
        public string PostalCode { get; set; } = string.Empty;

        [Column("phone")]
        [Required]
        public string Phone { get; set; } = string.Empty;

        [Column("is_default")]
        public bool IsDefault { get; set; } = false;
        
        // Navigation property to User (optional)
        [ForeignKey("UserId")]
        public virtual User? User { get; set; }
    }
} 