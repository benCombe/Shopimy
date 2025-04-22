using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Server.Services
{
    public class PromotionsService : IPromotionsService
    {
        private readonly AppDbContext _context;

        public PromotionsService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Promotion>> GetPromotionsByStoreAsync(int storeId)
        {
            return await _context.Promotions
                .Where(p => p.StoreId == storeId)
                .OrderByDescending(p => p.StartDate)
                .ToListAsync();
        }

        public async Task<Promotion?> GetPromotionByIdAsync(int promotionId, int storeId)
        {
            return await _context.Promotions
                .FirstOrDefaultAsync(p => p.PromotionId == promotionId && p.StoreId == storeId);
        }

        public async Task<Promotion> CreatePromotionAsync(Promotion promotion)
        {
            _context.Promotions.Add(promotion);
            await _context.SaveChangesAsync();
            return promotion;
        }

        public async Task<Promotion?> UpdatePromotionAsync(int promotionId, Promotion promotion)
        {
            if (promotionId != promotion.PromotionId)
            {
                return null;
            }

            // Ensure the promotion exists and belongs to the correct store
            var existingPromotion = await _context.Promotions
                .FirstOrDefaultAsync(p => p.PromotionId == promotionId && p.StoreId == promotion.StoreId);

            if (existingPromotion == null)
            {
                return null;
            }

            // Update promotion properties
            existingPromotion.Code = promotion.Code;
            existingPromotion.Description = promotion.Description;
            existingPromotion.DiscountType = promotion.DiscountType;
            existingPromotion.DiscountValue = promotion.DiscountValue;
            existingPromotion.StartDate = promotion.StartDate;
            existingPromotion.EndDate = promotion.EndDate;
            existingPromotion.IsActive = promotion.IsActive;
            existingPromotion.UsageLimit = promotion.UsageLimit;

            _context.Promotions.Update(existingPromotion);
            await _context.SaveChangesAsync();
            return existingPromotion;
        }

        public async Task<bool> DeletePromotionAsync(int promotionId, int storeId)
        {
            var promotion = await _context.Promotions
                .FirstOrDefaultAsync(p => p.PromotionId == promotionId && p.StoreId == storeId);

            if (promotion == null)
            {
                return false;
            }

            _context.Promotions.Remove(promotion);
            await _context.SaveChangesAsync();
            return true;
        }
    }
} 