using Microsoft.AspNetCore.Mvc;

//basic api controller
//URL = thisappsurl.com/api/classname(without 'Controller') --> shopimy.com/api/weatherforecast

[ApiController]
[Route("api/[controller]")]
public class WeatherForecastController : ControllerBase
{
    private static readonly string[] Summaries = new[]
    {
        "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
    };

    [HttpGet]
    public IEnumerable<WeatherForecast> Get()
    {
        //Console.WriteLine("API Call Received");
        var forecast = Enumerable.Range(1, 5).Select(index =>
        {
            int tempC = Random.Shared.Next(-50, 55);
            return new WeatherForecast
            (
                DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                tempC,
                Summaries[Random.Shared.Next(0, Summaries.Length)]
            );
        }).ToArray();

        //Console.WriteLine($"Returning: {forecast}");
        return forecast;
    }
}

public record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
