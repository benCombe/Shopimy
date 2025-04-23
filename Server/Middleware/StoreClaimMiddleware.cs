using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using System.Security.Claims;

namespace Server.Middleware
{
    public class StoreClaimMiddleware
    {
        private readonly RequestDelegate _next;

        public StoreClaimMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context, AppDbContext dbContext)
        {
            // Only process if user is authenticated
            if (context.User.Identity?.IsAuthenticated == true)
            {
                // Get user ID from claims
                var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out int userId))
                {
                    // Check if user already has a storeId claim
                    if (context.User.FindFirst("storeId") == null)
                    {
                        // Look up store associated with this user
                        var store = await dbContext.Stores
                            .FirstOrDefaultAsync(s => s.StoreOwnerId == userId);

                        if (store != null)
                        {
                            // Add store ID to the current request's ClaimsPrincipal
                            var identity = context.User.Identity as ClaimsIdentity;
                            identity?.AddClaim(new Claim("storeId", store.StoreId.ToString()));
                            
                            // Log for debugging
                            Console.WriteLine($"StoreClaimMiddleware: Added storeId claim {store.StoreId} for user {userId}");
                        }
                        else
                        {
                            Console.WriteLine($"StoreClaimMiddleware: No store found for user {userId}");
                        }
                    }
                }
            }

            // Continue processing
            await _next(context);
        }
    }

    // Extension method for easy middleware registration
    public static class StoreClaimMiddlewareExtensions
    {
        public static IApplicationBuilder UseStoreClaimMiddleware(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<StoreClaimMiddleware>();
        }
    }
} 