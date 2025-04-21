using Server.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Server.Repositories
{
    public interface IReviewRepository
    {
        Task<IEnumerable<Review>> GetReviewsByProductIdAsync(int productId);
        // Add other methods like AddReviewAsync, GetReviewByIdAsync etc. later if needed
    }
} 