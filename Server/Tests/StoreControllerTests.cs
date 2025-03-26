using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

/* needs to be public for xunit but throws errors
[Collection("Integration Tests")]
public class StoreControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;
    public StoreControllerTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetPageToLoad()
    {
        var response = await _client.GetAsync("/store");

        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        Console.WriteLine(content);
    }
}
*/