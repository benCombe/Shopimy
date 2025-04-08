using Microsoft.AspNetCore.Mvc;
using Server.Services;
using System.Threading.Tasks;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewService _reviewService;

        public ReviewsController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        // GET: api/Reviews/Product/{productId}
        [HttpGet("Product/{productId}")]
        public async Task<IActionResult> GetReviewsForProduct(int productId)
        {
            var reviews = await _reviewService.GetReviewsByProductIdAsync(productId);
            return Ok(reviews);
        }

        // GET: api/Reviews/Product/{productId}/AverageRating
        [HttpGet("Product/{productId}/AverageRating")]
        public async Task<IActionResult> GetAverageRatingForProduct(int productId)
        {
            var averageRating = await _reviewService.GetAverageRatingByProductIdAsync(productId);
            return Ok(new { AverageRating = averageRating });
        }

        // We can add a POST endpoint later for creating reviews
    }
} 