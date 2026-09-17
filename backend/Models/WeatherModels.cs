namespace WeatherMap.Backend.Models;

public record LocationItem(
    string Id,
    string Name,
    double Lat,
    double Lng,
    string? Country,
    string? Admin1
);

public record WeatherCodeInfo(
    string Description,
    string IconName,
    string Category
);
