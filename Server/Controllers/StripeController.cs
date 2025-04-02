using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

[ApiController]
[Route("api/[controller]")]
public class StripeController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public StripeController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    [HttpGet("config")]
    public ActionResult GetStripeConfig()
    {
        // Retrieve the Publishable Key from configuration (e.g., appsettings.json or secrets)
        var publicKey = _configuration["Stripe:PublishableKey"];

        if (string.IsNullOrEmpty(publicKey))
        {
            // Handle the case where the key is missing in configuration
            // Log an error or return a specific error response
            return StatusCode(500, "Stripe publishable key is not configured.");
        }

        return Ok(new { publicKey });
    }
} 