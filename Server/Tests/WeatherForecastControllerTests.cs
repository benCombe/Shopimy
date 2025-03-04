public class WeatherForecastControllerTests
{
    [Fact]
    public async Task GET_retrieves_weather_forecast()
    {
        await using var application = new WebApplicationFactory<Api.Startup>();
        using var client = application.CreateClient();
 
        var response = await client.GetAsync("/weatherforecast");
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}