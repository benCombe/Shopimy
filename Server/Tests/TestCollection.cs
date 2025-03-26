using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Xunit;

/*
[CollectionDefinition("Integration Tests")]
public class IntegrationTestCollection : ICollectionFixture<WebApplicationFactory<Program>>
{
}
*/
/*
namespace Server.Tests
{
    public class ProgramTest
    {
        private readonly HttpClient _client;
        private readonly IHost _host;

        public ProgramTest()
        {
            _host = new HostBuilder()
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseTestServer();
                    webBuilder.UseStartup<Startup>();
                })
                .Start();

            _client = _host.GetTestClient();
        }

        [Fact]
        public async Task TestSwaggerEndpoint_ReturnsSuccess()
        {
            // Arrange
            var request = new HttpRequestMessage(HttpMethod.Get, "/swagger/v1/swagger.json");

            // Act
            var response = await _client.SendAsync(request);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task TestCorsPolicy_AllowsAngularApp()
        {
            // Arrange
            var request = new HttpRequestMessage(HttpMethod.Options, "/api/test")
            {
                Headers =
                {
                    { "Origin", "http://localhost:4200" },
                    { "Access-Control-Request-Method", "GET" }
                }
            };

            // Act
            var response = await _client.SendAsync(request);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.True(response.Headers.Contains("Access-Control-Allow-Origin"));
        }

        [Fact]
        public async Task TestAuthenticationMiddleware_RejectsUnauthorizedRequest()
        {
            // Arrange
            var request = new HttpRequestMessage(HttpMethod.Get, "/api/protected");

            // Act
            var response = await _client.SendAsync(request);

            // Assert
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task TestRoutingMiddleware_ReturnsNotFoundForInvalidRoute()
        {
            // Arrange
            var request = new HttpRequestMessage(HttpMethod.Get, "/invalid-route");

            // Act
            var response = await _client.SendAsync(request);

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        public void Dispose()
        {
            _host.Dispose();
            _client.Dispose();
        }
    }
}
*/