using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;
using Server.Repositories;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Server.Repositories
{
    public class ReviewRepository : IReviewRepository
    {
        private readonly AppDbContext _context;

        public ReviewRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Review>> GetReviewsByProductIdAsync(int productId)
        {
            // Assuming the DbSet will be named 'Reviews' in AppDbContext
            return await _context.Reviews
                                 .Where(r => r.ProductId == productId)
                                 .OrderByDescending(r => r.CreatedAt) // Show newest first
                                 .ToListAsync();
        }
    }
} 