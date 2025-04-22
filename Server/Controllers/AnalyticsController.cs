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
using Microsoft.Extensions.Logging;

namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AnalyticsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IAnalyticsService _analyticsService;
        private readonly ILogger<AnalyticsController> _logger;

        public AnalyticsController(AppDbContext context, IAnalyticsService analyticsService, ILogger<AnalyticsController> logger)
        {
            _context = context;
            _analyticsService = analyticsService;
            _logger = logger;
        }

        // Helper method to get the store ID for the authenticated user
        private async Task<int> GetStoreIdForUserAsync()
        {
            int userId = 0;
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out userId))
            {
                return -1; // Invalid user ID
            }

            // Get the store ID for this user
            var store = await _context.Stores
                .Where(s => s.StoreOwnerId == userId)
                .FirstOrDefaultAsync();

            return store?.StoreId ?? -1;
        }

        [HttpGet("store-visits")]
        public async Task<ActionResult<object>> GetStoreVisits(
            [FromQuery] string period = "daily", 
            [FromQuery] int range = 7)
        {
            try
            {
                int storeId = await GetStoreIdForUserAsync();
                if (storeId == -1)
                {
                    return Unauthorized("Invalid authentication token or store not found.");
                }

                var result = await _analyticsService.GetStoreVisitsAsync(storeId, period, range);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting store visits: {ErrorMessage}", ex.Message);
                return StatusCode(500, "An error occurred while retrieving visit analytics.");
            }
        }

        [HttpGet("sales-data")]
        public async Task<ActionResult<object>> GetSalesData(
            [FromQuery] string period = "daily", 
            [FromQuery] int range = 30)
        {
            try
            {
                int storeId = await GetStoreIdForUserAsync();
                if (storeId == -1)
                {
                    return Unauthorized("Invalid authentication token or store not found.");
                }

                var result = await _analyticsService.GetSalesDataAsync(storeId, period, range);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sales data: {ErrorMessage}", ex.Message);
                return StatusCode(500, "An error occurred while retrieving sales analytics.");
            }
        }

        [HttpGet("top-products")]
        public async Task<ActionResult<object>> GetTopProducts(
            [FromQuery] int limit = 10,
            [FromQuery] DateTime? startDate = null, 
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                int storeId = await GetStoreIdForUserAsync();
                if (storeId == -1)
                {
                    return Unauthorized("Invalid authentication token or store not found.");
                }

                var result = await _analyticsService.GetTopSellingProductsAsync(storeId, limit, startDate, endDate);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting top products: {ErrorMessage}", ex.Message);
                return StatusCode(500, "An error occurred while retrieving top products analytics.");
            }
        }

        [HttpGet("kpis")]
        public async Task<ActionResult<object>> GetKeyPerformanceIndicators()
        {
            try
            {
                int storeId = await GetStoreIdForUserAsync();
                if (storeId == -1)
                {
                    return Unauthorized("Invalid authentication token or store not found.");
                }

                var result = await _analyticsService.GetKeyPerformanceIndicatorsAsync(storeId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting KPIs: {ErrorMessage}", ex.Message);
                return StatusCode(500, "An error occurred while retrieving key performance indicators.");
            }
        }

        [HttpGet("item-quantity")]
        [AllowAnonymous]
        public async Task<ActionResult<VisitAnalyticsResponse>> GetStoreVisits(int storeid)
        {
            var authHeader = Request.Headers["Authorization"].ToString();
            
            authHeader= authHeader.Remove(0,7);
            // Get user ID from the token claims
            /*int userId = 0;
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out userId))
            {
                return Unauthorized("Invalid authentication token.");
            }

            // Get the store ID for this user
            var store = await _context.Stores
                .Where(s => s.StoreOwnerId == userId)
                .FirstOrDefaultAsync();

            if (store == null)
            {
                return NotFound("Store not found for this user.");
            }*/
            storeid=10000005;
            var activeUser = await _context.ActiveUsers.FromSqlRaw(@"SELECT * from ActiveUsers au where au.token ={0}",authHeader).ToListAsync();
            var store = await _context.Stores
                .Where(s => s.StoreOwnerId == activeUser[0].UserId)
                .FirstOrDefaultAsync();
            
            var quality= await _context.Quantity.FromSqlRaw(@"select l.name as Name ,SUM(pl.quantity) AS TotalQuantity 
                                                        from PurchaseLog pl
                                                        join Items i on i.item_id =pl.item_id
                                                        join Listing l on l.list_id = i.list_id
                                                        where pl.store_id ={0}
                                                        group by l.name ;",store.StoreId).ToListAsync();
            return Ok(quality);
        }
    }

    
} 