using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

public class CatergoriesControllerTests
{
    private readonly HttpClient _client;
    private CatergoriesControllerTests(WebApplicationFactory<Program> factory)
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