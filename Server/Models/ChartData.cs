using System.Collections.Generic;

namespace Server.Models
{
    /// <summary>
    /// Model to represent chart data for analytics
    /// </summary>
    public class ChartData
    {
        /// <summary>
        /// Labels for the chart axis (often time periods)
        /// </summary>
        public List<string> Labels { get; set; } = new List<string>();

        /// <summary>
        /// Generic data values (used for simple charts)
        /// </summary>
        public List<int> Data { get; set; } = new List<int>();

        /// <summary>
        /// Revenue values for sales charts
        /// </summary>
        public List<double> Revenue { get; set; } = new List<double>();

        /// <summary>
        /// Order count values for order charts
        /// </summary>
        public List<int> OrderCount { get; set; } = new List<int>();

        /// <summary>
        /// Average order value data points
        /// </summary>
        public List<double> AverageOrderValue { get; set; } = new List<double>();
    }
} 