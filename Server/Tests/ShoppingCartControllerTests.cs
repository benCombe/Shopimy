using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

[Collection("Integration Tests")]
public class ShoppingCartControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;
    internal ShoppingCartControllerTests(WebApplicationFactory<Program> factory)
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