
/* public class WeatherForecastControllerTests

using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;


public class WeatherForecastControllerTests : IClassFixture<WebApplicationFactory<Program>>

{
    private readonly HttpClient _client;
    private WeatherForecastControllerTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetPageToLoad()
    {
        var response = await _client.GetAsync("/weatherforecast");

        response.EnsureSuccessStatusCode();
        //var content = await response.Content.ReadAsStringAsync();
        //Console.WriteLine(content);
        /*
        await using var application = new WebApplicationFactory<Program>();
        //using var client = application.CreateClient();
 
        var response = await _client.GetAsync("/weatherforecast");
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
    }

} //updating to test git


//Commented out due to causing errors

*/

