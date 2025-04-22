using Server.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Server.Services
{
    public interface IPromotionsService
    {
        Task<IEnumerable<Promotion>> GetPromotionsByStoreAsync(int storeId);
        Task<Promotion?> GetPromotionByIdAsync(int promotionId, int storeId);
        Task<Promotion> CreatePromotionAsync(Promotion promotion);
        Task<Promotion?> UpdatePromotionAsync(int promotionId, Promotion promotion);
        Task<bool> DeletePromotionAsync(int promotionId, int storeId);
    }
} 