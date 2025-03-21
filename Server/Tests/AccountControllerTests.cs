using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

public class AccountControllerTests
{
    private readonly HttpClient _client;
    private AccountControllerTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }
    
    [Fact]
    public async Task GetPageToLoad()
    {
        var task = _client.PostAsync("/account", new StringContent(string.Empty));
        var response = task.GetAwaiter().GetResult();

        response.EnsureSuccessStatusCode();

    }
    
}