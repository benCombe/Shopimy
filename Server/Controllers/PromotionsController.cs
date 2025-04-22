using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;
using Server.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PromotionsController : ControllerBase
    {
        private readonly IPromotionsService _promotionsService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly AppDbContext _context;

        public PromotionsController(IPromotionsService promotionsService, IHttpContextAccessor httpContextAccessor, AppDbContext context)
        {
            _promotionsService = promotionsService;
            _httpContextAccessor = httpContextAccessor;
            _context = context;
        }

        // Helper method to get the current user's storeId
        private async Task<(bool isOwner, int storeId)> VerifyStoreOwnership(int? providedStoreId = null)
        {
            var userId = int.Parse(_httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
            if (userId == 0)
            {
                return (false, 0);
            }

            var userStore = await _context.Stores.FirstOrDefaultAsync(s => s.StoreOwnerId == userId);
            if (userStore == null)
            {
                return (false, 0);
            }

            // If a storeId was provided, verify it matches the user's store
            if (providedStoreId.HasValue && providedStoreId.Value != userStore.StoreId)
            {
                return (false, 0);
            }

            return (true, userStore.StoreId);
        }

        // GET: api/Promotions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Promotion>>> GetPromotions()
        {
            var (isOwner, storeId) = await VerifyStoreOwnership();
            if (!isOwner)
            {
                return Unauthorized("You don't have a store or are not authorized to view promotions.");
            }

            var promotions = await _promotionsService.GetPromotionsByStoreAsync(storeId);
            return Ok(promotions);
        }

        // GET: api/Promotions/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Promotion>> GetPromotion(int id)
        {
            var (isOwner, storeId) = await VerifyStoreOwnership();
            if (!isOwner)
            {
                return Unauthorized("You don't have a store or are not authorized to view this promotion.");
            }

            var promotion = await _promotionsService.GetPromotionByIdAsync(id, storeId);

            if (promotion == null)
            {
                return NotFound("Promotion not found or you don't have permission to view it.");
            }

            return Ok(promotion);
        }

        // POST: api/Promotions
        [HttpPost]
        public async Task<ActionResult<Promotion>> CreatePromotion(Promotion promotion)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var (isOwner, storeId) = await VerifyStoreOwnership();
            if (!isOwner)
            {
                return Unauthorized("You don't have a store or are not authorized to create promotions.");
            }

            // Ensure the promotion is created for the user's store
            promotion.StoreId = storeId;

            try
            {
                var createdPromotion = await _promotionsService.CreatePromotionAsync(promotion);
                return CreatedAtAction(nameof(GetPromotion), new { id = createdPromotion.PromotionId }, createdPromotion);
            }
            catch (Exception ex)
            {
                return BadRequest($"Failed to create promotion: {ex.Message}");
            }
        }

        // PUT: api/Promotions/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePromotion(int id, Promotion promotion)
        {
            if (id != promotion.PromotionId)
            {
                return BadRequest("The promotion ID in the URL does not match the ID in the request body.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var (isOwner, storeId) = await VerifyStoreOwnership();
            if (!isOwner)
            {
                return Unauthorized("You don't have a store or are not authorized to update this promotion.");
            }

            // Ensure the promotion is updated for the user's store
            promotion.StoreId = storeId;

            var updatedPromotion = await _promotionsService.UpdatePromotionAsync(id, promotion);
            if (updatedPromotion == null)
            {
                return NotFound("Promotion not found or you don't have permission to update it.");
            }

            return Ok(updatedPromotion);
        }

        // DELETE: api/Promotions/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePromotion(int id)
        {
            var (isOwner, storeId) = await VerifyStoreOwnership();
            if (!isOwner)
            {
                return Unauthorized("You don't have a store or are not authorized to delete this promotion.");
            }

            var result = await _promotionsService.DeletePromotionAsync(id, storeId);
            if (!result)
            {
                return NotFound("Promotion not found or you don't have permission to delete it.");
            }

            return NoContent();
        }
    }
} 