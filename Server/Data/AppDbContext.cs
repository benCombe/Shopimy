using Microsoft.EntityFrameworkCore;
using Server.Models;

namespace Server.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<TestItem> TestTable { get; set; }
         public DbSet<User> Users { get; set; }  // ✅ Add this line
        public DbSet<ActiveUser> ActiveUsers { get; set; }  // ✅ Add this too
        public DbSet<Category> Categories { get; internal set; }

        // Ensure table names match conventions
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Define table names explicitly (optional)
            modelBuilder.Entity<User>().ToTable("Users");
            modelBuilder.Entity<ActiveUser>().ToTable("ActiveUsers");
            modelBuilder.Entity<TestItem>().ToTable("TestTable");  
        }
    }
}