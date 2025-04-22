using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AnalyticsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AnalyticsController(AppDbContext context)
        {
            _context = context;
        }

        // Model for the analytics response
        public class VisitAnalyticsResponse
        {
            public List<string> Labels { get; set; } = new List<string>();
            public List<int> Data { get; set; } = new List<int>();
        }

        [HttpGet("store-visits")]
        public async Task<ActionResult<VisitAnalyticsResponse>> GetStoreVisits(
            [FromQuery] string period = "daily", 
            [FromQuery] int range = 7)
        {
            try
            {
                // Get user ID from the token claims
                int userId = 0;
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
                }

                // Create result object
                var result = new VisitAnalyticsResponse();
                
                // Calculate the start date based on period and range
                var endDate = DateTime.UtcNow;
                var startDate = period.ToLower() switch
                {
                    "monthly" => endDate.AddMonths(-range),
                    _ => endDate.AddDays(-range) // default is daily
                };

                // Format for dates
                var dateFormat = period.ToLower() switch
                {
                    "monthly" => "MMM yyyy", // e.g. Jan 2023
                    _ => "MMM dd" // e.g. Jan 01
                };

                if (period.ToLower() == "monthly")
                {
                    // Group by month
                    var monthlyData = await _context.StoreVisits
                        .Where(v => v.StoreId == store.StoreId && v.VisitTimestamp >= startDate)
                        .GroupBy(v => new { 
                            Year = v.VisitTimestamp.Year, 
                            Month = v.VisitTimestamp.Month 
                        })
                        .Select(g => new {
                            Date = new DateTime(g.Key.Year, g.Key.Month, 1),
                            Count = g.Count()
                        })
                        .OrderBy(x => x.Date)
                        .ToListAsync();

                    // Fill in all months in the range
                    var current = new DateTime(startDate.Year, startDate.Month, 1);
                    while (current <= endDate)
                    {
                        var monthData = monthlyData.FirstOrDefault(d => d.Date.Year == current.Year && d.Date.Month == current.Month);
                        result.Labels.Add(current.ToString(dateFormat));
                        result.Data.Add(monthData?.Count ?? 0);
                        current = current.AddMonths(1);
                    }
                }
                else
                {
                    // Group by day (default)
                    var dailyData = await _context.StoreVisits
                        .Where(v => v.StoreId == store.StoreId && v.VisitTimestamp >= startDate)
                        .GroupBy(v => new { 
                            Year = v.VisitTimestamp.Year, 
                            Month = v.VisitTimestamp.Month, 
                            Day = v.VisitTimestamp.Day 
                        })
                        .Select(g => new {
                            Date = new DateTime(g.Key.Year, g.Key.Month, g.Key.Day),
                            Count = g.Count()
                        })
                        .OrderBy(x => x.Date)
                        .ToListAsync();

                    // Fill in all days in the range
                    var current = startDate.Date;
                    while (current <= endDate)
                    {
                        var dayData = dailyData.FirstOrDefault(d => d.Date.Date == current.Date);
                        result.Labels.Add(current.ToString(dateFormat));
                        result.Data.Add(dayData?.Count ?? 0);
                        current = current.AddDays(1);
                    }
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting store visits: {ex.Message}");
                return StatusCode(500, "An error occurred while retrieving visit analytics.");
            }
        }

        [HttpGet("item-quantity")]
        [AllowAnonymous]
        public async Task<ActionResult<VisitAnalyticsResponse>> GetStoreVisits(int storeid)
        {
            // Get user ID from the token claims
            int userId = 0;
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
            }
            storeid=1000005;
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