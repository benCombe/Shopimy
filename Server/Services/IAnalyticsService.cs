using Server.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Server.Services
{
    /// <summary>
    /// Interface for the analytics service
    /// </summary>
    public interface IAnalyticsService
    {
        /// <summary>
        /// Gets key performance indicators for a store
        /// </summary>
        /// <param name="storeId">ID of the store</param>
        /// <returns>Object containing KPIs like total orders, revenue, etc.</returns>
        Task<object> GetKeyPerformanceIndicatorsAsync(int storeId);

        /// <summary>
        /// Gets sales data for chart visualization
        /// </summary>
        /// <param name="storeId">ID of the store</param>
        /// <param name="timePeriod">Time period for the data (day, week, month)</param>
        /// <param name="range">Range for the data (default is 30 days)</param>
        /// <returns>Chart data with labels and datasets</returns>
        Task<ChartData> GetSalesDataAsync(int storeId, string timePeriod, int range = 30);

        /// <summary>
        /// Gets store visit data for chart visualization
        /// </summary>
        /// <param name="storeId">ID of the store</param>
        /// <param name="timePeriod">Time period for the data (day, week, month)</param>
        /// <param name="range">Range for the data (default is 7 days)</param>
        /// <returns>Chart data with labels and datasets</returns>
        Task<ChartData> GetStoreVisitsAsync(int storeId, string timePeriod, int range = 7);

        /// <summary>
        /// Gets top selling products for a store
        /// </summary>
        /// <param name="storeId">ID of the store</param>
        /// <param name="limit">Maximum number of products to return</param>
        /// <param name="startDate">Optional start date for filtering</param>
        /// <param name="endDate">Optional end date for filtering</param>
        /// <returns>List of top selling products with quantities and revenue</returns>
        Task<object> GetTopSellingProductsAsync(int storeId, int limit, DateTime? startDate, DateTime? endDate);
    }
} 