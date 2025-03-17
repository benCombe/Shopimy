using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

/*not working at the moment
public class ItemsControllerTests
{
    private readonly HttpClient _client;
    private ItemsControllerTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetPageToLoad()
    {
        var response = await _client.GetAsync("/items");

        response.EnsureSuccessStatusCode();

    }
}
*/