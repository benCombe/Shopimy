using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

/*not working at the moment
[Collection("Integration Tests")]
public class ItemsControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;
    internal ItemsControllerTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetPageToLoad()
    {
        var response = await _client.GetAsync("/item");

        response.EnsureSuccessStatusCode();

    }
}
*/