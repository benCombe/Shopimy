using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

public class StoreControllerTests
{
    private readonly HttpClient _client;
    private StoreControllerTests(WebApplicationFactory<Program> factory)
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