/* 
    This file is for direct Object linking to the database for easier queries with less code
    
    
    >> Do not touch unless you know what you are doing!! << Message Ben C for any questions
 */


using Microsoft.EntityFrameworkCore;
using Server.Models;
using Shopimy.Server.Models;
using Stripe.Climate;

namespace Server.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<TestItem> TestTable { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<ActiveUser> ActiveUsers { get; set; }
        public DbSet<Store> Stores { get; set; }
        public DbSet<StoreTheme> StoreThemes {get; set;}
        public DbSet<BasicItem> BasicItem {get; set;}
        public DbSet<DetailItem> DetailItem {get; set;}
        public DbSet<Category> Categories { get; internal set; }
        public DbSet<ShoppingCart> ShoppingCarts { get; set; }
        public DbSet<StoreBanner> StoreBanners { get; set; }
        public DbSet<StoreLogo> StoreLogos { get; set; }
        public DbSet<OrderLogEntry> OrderLog {get; set;}
        public DbSet<OrderItem> OrderItems {get; set;}
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Server.Models.Order> Orders { get; set; }
        public DbSet<StoreVisit> StoreVisits { get; set; }
        public DbSet<Promotion> Promotions { get; set; }
        public DbSet<Quantity> Quantity{get; set;}
        public DbSet<Total> Total{get; set;}
        public DbSet<DeliveryAddress> DeliveryAddresses { get; set; }


        // Ensure table names match conventions  
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Define table names explicitly (optional)
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("Users");
                entity.Property(e => e.FirstName).HasColumnName("first_name");
                entity.Property(e => e.LastName).HasColumnName("last_name");
                entity.Property(e => e.Email).HasColumnName("email");
                entity.Property(e => e.Phone).HasColumnName("phone");
                entity.Property(e => e.Address).HasColumnName("address");
                entity.Property(e => e.Country).HasColumnName("country");
                entity.Property(e => e.Password).HasColumnName("password");
                entity.Property(e => e.Verified).HasColumnName("verified");
                entity.Property(e => e.Subscribed).HasColumnName("subscribed");
                entity.Property(e => e.DOB).HasColumnName("dob");
                entity.Property(e => e.StripeCustomerId).HasColumnName("stripe_customer_id");
            });

            modelBuilder.Entity<ActiveUser>(entity =>
            {
                entity.ToTable("ActiveUsers");  // Ensure correct table mapping

                entity.HasKey(e => e.UserId);  // Primary key (user_id)

                entity.Property(e => e.UserId)
                    .HasColumnName("user_id");  // Ensure correct column name

                entity.Property(e => e.LoginDate)
                    .HasColumnName("login_date")
                    .HasDefaultValueSql("SYSUTCDATETIME()");  // Match default SQL value

                entity.Property(e => e.Token)
                    .HasColumnName("token")
                    .IsRequired();

                // Foreign key relationship with Users
                entity.HasOne<User>()
                    .WithOne()
                    .HasForeignKey<ActiveUser>(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<DeliveryAddress>(entity =>
            {
                entity.ToTable("DeliveryAddresses");
                
                entity.HasKey(e => e.Id);
                
                // Establish relationship with User
                entity.HasOne(d => d.User)
                    .WithMany()
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Store>().ToTable("Stores");
            modelBuilder.Entity<StoreTheme>().ToTable("StoreThemes");
            modelBuilder.Entity<StoreBanner>().ToTable("StoreBanners");
            modelBuilder.Entity<StoreLogo>().ToTable("StoreLogos");
            modelBuilder.Entity<Category>().ToTable("Categories");
            modelBuilder.Entity<BasicItem>().HasNoKey();
            modelBuilder.Entity<DetailItem>().HasNoKey();
            modelBuilder.Entity<Quantity>().HasNoKey();
            modelBuilder.Entity<Total>().HasNoKey();
            modelBuilder.Entity<ShoppingCart>().ToTable("ShoppingCarts");
            modelBuilder.Entity<ActiveUser>().ToTable("ActiveUsers");
            modelBuilder.Entity<TestItem>().ToTable("TestTable");
            modelBuilder.Entity<OrderLogEntry>().ToTable("OrderLog");
            modelBuilder.Entity<OrderItem>().ToTable("OrderItems");
            modelBuilder.Entity<Review>().ToTable("Reviews");
            modelBuilder.Entity<Server.Models.Order>().ToTable("Orders");
            modelBuilder.Entity<OrderItem>().ToTable("OrderItems");
            modelBuilder.Entity<StoreVisit>().ToTable("StoreVisits");
            modelBuilder.Entity<Promotion>().ToTable("Promotions");
            modelBuilder.Entity<DeliveryAddress>().ToTable("DeliveryAddresses");
        }
    }
}