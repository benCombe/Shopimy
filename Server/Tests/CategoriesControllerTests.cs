using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

[Collection("Integration Tests")]
public class CatergoriesControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;
    internal CatergoriesControllerTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetPageToLoad()
    {
        var response = await _client.GetAsync("/catergories");

        response.EnsureSuccessStatusCode();

    }
}