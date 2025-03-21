using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

[Collection("Integration Tests")]
public class AccountControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    internal AccountControllerTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetPageToLoad()
    {
        var response = await _client.PostAsync("/account", new StringContent(string.Empty));
        response.EnsureSuccessStatusCode();
    }
}