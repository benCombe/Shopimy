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
    [ApiController]
    [Route("api/user-delivery")]
    [Authorize]
    public class UserDeliveryController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserDeliveryController(AppDbContext context)
        {
            _context = context;
        }

        // Save a new delivery address
        [HttpPost("save")]
        public async Task<ActionResult<bool>> SaveDeliveryAddress([FromBody] DeliveryAddress deliveryAddress)
        {
            try
            {
                // Verify userId from token matches the delivery address
                var userId = GetCurrentUserId();
                if (userId != deliveryAddress.UserId)
                {
                    return Unauthorized("User ID mismatch.");
                }

                // If this is set as default, unset any previous default
                if (deliveryAddress.IsDefault)
                {
                    await UnsetPreviousDefaultAddress(userId);
                }

                // Add the new address to the database
                await _context.DeliveryAddresses.AddAsync(deliveryAddress);
                await _context.SaveChangesAsync();

                return Ok(true);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // Get all delivery addresses for a user
        [HttpGet("addresses/{userId}")]
        public async Task<ActionResult<IEnumerable<DeliveryAddress>>> GetDeliveryAddresses(int userId)
        {
            try
            {
                // Verify user requesting their own addresses
                var currentUserId = GetCurrentUserId();
                if (currentUserId != userId)
                {
                    return Unauthorized("Cannot access another user's addresses.");
                }

                var addresses = await _context.DeliveryAddresses
                    .Where(a => a.UserId == userId)
                    .ToListAsync();

                return Ok(addresses);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // Get a specific delivery address
        [HttpGet("address/{addressId}")]
        public async Task<ActionResult<DeliveryAddress>> GetDeliveryAddress(int addressId)
        {
            try
            {
                var address = await _context.DeliveryAddresses.FindAsync(addressId);
                if (address == null)
                {
                    return NotFound("Address not found.");
                }

                // Verify user owns the address
                var currentUserId = GetCurrentUserId();
                if (currentUserId != address.UserId)
                {
                    return Unauthorized("Cannot access another user's address.");
                }

                return Ok(address);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // Update a delivery address
        [HttpPut("address/{addressId}")]
        public async Task<ActionResult<bool>> UpdateDeliveryAddress(int addressId, [FromBody] DeliveryAddress deliveryAddress)
        {
            try
            {
                if (addressId != deliveryAddress.Id)
                {
                    return BadRequest("Address ID mismatch.");
                }

                var existingAddress = await _context.DeliveryAddresses.FindAsync(addressId);
                if (existingAddress == null)
                {
                    return NotFound("Address not found.");
                }

                // Verify user owns the address
                var currentUserId = GetCurrentUserId();
                if (currentUserId != existingAddress.UserId)
                {
                    return Unauthorized("Cannot modify another user's address.");
                }

                // If this is being set as default, unset any previous default
                if (deliveryAddress.IsDefault && !existingAddress.IsDefault)
                {
                    await UnsetPreviousDefaultAddress(currentUserId);
                }

                // Update the address
                _context.Entry(existingAddress).State = EntityState.Detached;
                _context.Entry(deliveryAddress).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                return Ok(true);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // Delete a delivery address
        [HttpDelete("address/{addressId}")]
        public async Task<ActionResult<bool>> DeleteDeliveryAddress(int addressId)
        {
            try
            {
                var address = await _context.DeliveryAddresses.FindAsync(addressId);
                if (address == null)
                {
                    return NotFound("Address not found.");
                }

                // Verify user owns the address
                var currentUserId = GetCurrentUserId();
                if (currentUserId != address.UserId)
                {
                    return Unauthorized("Cannot delete another user's address.");
                }

                _context.DeliveryAddresses.Remove(address);
                await _context.SaveChangesAsync();

                return Ok(true);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // Set a delivery address as default
        [HttpPut("default")]
        public async Task<ActionResult<bool>> SetDefaultDeliveryAddress([FromBody] DefaultAddressRequest request)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                if (currentUserId != request.UserId)
                {
                    return Unauthorized("User ID mismatch.");
                }

                var address = await _context.DeliveryAddresses.FindAsync(request.AddressId);
                if (address == null)
                {
                    return NotFound("Address not found.");
                }

                if (address.UserId != currentUserId)
                {
                    return Unauthorized("Cannot modify another user's address.");
                }

                // Unset any previous default
                await UnsetPreviousDefaultAddress(currentUserId);

                // Set the new default
                address.IsDefault = true;
                await _context.SaveChangesAsync();

                return Ok(true);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // Helper method to unset any previous default address
        private async Task UnsetPreviousDefaultAddress(int userId)
        {
            var defaultAddresses = await _context.DeliveryAddresses
                .Where(a => a.UserId == userId && a.IsDefault)
                .ToListAsync();

            foreach (var address in defaultAddresses)
            {
                address.IsDefault = false;
            }

            await _context.SaveChangesAsync();
        }

        // Helper method to get current user ID from claims
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return 0;
            }
            return userId;
        }
    }

    // DTO for setting default address
    public class DefaultAddressRequest
    {
        public int UserId { get; set; }
        public int AddressId { get; set; }
    }
} 