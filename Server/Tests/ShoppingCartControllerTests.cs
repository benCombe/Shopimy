using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

public class ShoppingCartControllerTests
{
    private readonly HttpClient _client;
    private ShoppingCartControllerTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetPageToLoad()
    {
        var response = await _client.GetAsync("/shoppingcart");

        response.EnsureSuccessStatusCode();

    }
}