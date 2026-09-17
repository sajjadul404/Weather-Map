// Program.cs - ASP.NET Core Web API Weather Service Backend (.NET 8 / C#)
// This C# backend provides meteorological REST endpoints, Open-Meteo proxying, and caching.

using System.Text.Json;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Enable CORS for Frontend (.js / Vite / React)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddHttpClient();
builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

app.UseCors();

// 1. Health Check Endpoint
app.MapGet("/api/health", () => Results.Ok(new
{
    status = "healthy",
    runtime = ".NET 8 / C# Backend Service",
    timestamp = DateTime.UtcNow
}));

// 2. Weather Endpoint (Fetches real meteorological data by coordinates)
app.MapGet("/api/weather", async (double lat, double lng, IHttpClientFactory clientFactory) =>
{
    try
    {
        var client = clientFactory.CreateClient();
        var url = $"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto";
        
        var response = await client.GetAsync(url);
        if (!response.IsSuccessStatusCode)
        {
            return Results.StatusCode((int)response.StatusCode);
        }

        var json = await response.Content.ReadAsStringAsync();
        return Results.Content(json, "application/json");
    }
    catch (Exception ex)
    {
        return Results.Problem($"Failed to fetch weather data: {ex.Message}");
    }
});

// 3. Geocoding / Search Locations Endpoint
app.MapGet("/api/locations/search", async (string query, IHttpClientFactory clientFactory) =>
{
    if (string.IsNullOrWhiteSpace(query) || query.Trim().Length < 2)
    {
        return Results.Ok(Array.Empty<object>());
    }

    try
    {
        var client = clientFactory.CreateClient();
        var url = $"https://geocoding-api.open-meteo.com/v1/search?name={Uri.EscapeDataString(query.Trim())}&count=7&language=en&format=json";
        
        var response = await client.GetAsync(url);
        if (!response.IsSuccessStatusCode)
        {
            return Results.StatusCode((int)response.StatusCode);
        }

        var json = await response.Content.ReadAsStringAsync();
        return Results.Content(json, "application/json");
    }
    catch (Exception ex)
    {
        return Results.Problem($"Failed to search locations: {ex.Message}");
    }
});

// 4. Predefined Default Regional Hubs
app.MapGet("/api/locations/defaults", () => Results.Ok(new[]
{
    new { id = "dhaka", name = "Dhaka", lat = 23.8103, lng = 90.4125, country = "Bangladesh", admin1 = "Dhaka Division" },
    new { id = "chittagong", name = "Chittagong", lat = 22.3569, lng = 91.7832, country = "Bangladesh", admin1 = "Chattogram Division" },
    new { id = "sylhet", name = "Sylhet", lat = 24.8949, lng = 91.8687, country = "Bangladesh", admin1 = "Sylhet Division" },
    new { id = "rajshahi", name = "Rajshahi", lat = 24.3636, lng = 88.6241, country = "Bangladesh", admin1 = "Rajshahi Division" },
    new { id = "khulna", name = "Khulna", lat = 22.8456, lng = 89.5403, country = "Bangladesh", admin1 = "Khulna Division" },
    new { id = "rangpur", name = "Rangpur", lat = 25.7439, lng = 89.2752, country = "Bangladesh", admin1 = "Rangpur Division" },
    new { id = "mymensingh", name = "Mymensingh", lat = 24.7471, lng = 90.4203, country = "Bangladesh", admin1 = "Mymensingh Division" },
    new { id = "barisal", name = "Barisal", lat = 22.701, lng = 90.3535, country = "Bangladesh", admin1 = "Barishal Division" },
    new { id = "coxsbazar", name = "Cox's Bazar", lat = 21.4272, lng = 92.0058, country = "Bangladesh", admin1 = "Bay of Bengal Coast" },
    new { id = "kolkata", name = "Kolkata", lat = 22.5726, lng = 88.3639, country = "India", admin1 = "West Bengal" },
    new { id = "guwahati", name = "Guwahati", lat = 26.1445, lng = 91.7362, country = "India", admin1 = "Assam" },
    new { id = "yangon", name = "Yangon", lat = 16.8661, lng = 96.1951, country = "Myanmar", admin1 = "Yangon Region" }
}));

app.Run();
