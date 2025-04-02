using Server.Models;
using Server.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Server.Services
{
    public class ReviewService : IReviewService
    {
        private readonly IReviewRepository _reviewRepository;

        public ReviewService(IReviewRepository reviewRepository)
        {
            _reviewRepository = reviewRepository;
        }

        public async Task<IEnumerable<Review>> GetReviewsByProductIdAsync(int productId)
        {
            return await _reviewRepository.GetReviewsByProductIdAsync(productId);
        }

        public async Task<double> GetAverageRatingByProductIdAsync(int productId)
        {
            var reviews = await _reviewRepository.GetReviewsByProductIdAsync(productId);
            if (!reviews.Any())
            {
                return 0; // Or maybe null, depending on requirements
            }
            return reviews.Average(r => r.Rating);
        }
    }
} 