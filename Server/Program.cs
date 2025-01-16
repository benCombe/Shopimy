var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers(); // Add controller services
builder.Services.AddOpenApi(); // Add services to the container.

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins("http://localhost:4200") // Angular app's URL
              .AllowAnyHeader()
              .AllowAnyMethod()
              .SetIsOriginAllowed(_ => true) // Allow any origin (for debugging)
              .AllowCredentials(); // Add this if cookies or credentials are involved
    });
});

var app = builder.Build();

// Apply the CORS policy
app.UseCors("AllowAngularApp");

app.Use(async (context, next) =>
{
    Console.WriteLine($"Request: {context.Request.Method} {context.Request.Path}");
    await next();
});

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

//app.UseHttpsRedirection();

app.UseRouting();
//app.UseAuthorization();
app.MapControllers(); // Map controllers
app.Run();



