namespace WeatherMap.Backend.Services;

public static class WeatherHelper
{
    public static string GetTemperatureColor(double tempC) => tempC switch
    {
        < 10 => "#3b82f6", // Blue
        < 20 => "#06b6d4", // Cyan
        < 25 => "#10b981", // Green
        < 30 => "#eab308", // Yellow
        < 35 => "#f97316", // Orange
        _ => "#ef4444"      // Red
    };
}
