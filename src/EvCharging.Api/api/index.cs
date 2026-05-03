using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace EvCharging.Api;

public static class Handler
{
    public static async Task<IActionResult> Run(HttpRequest req)
    {
        // This is a serverless function entry point for Vercel
        // Vercel doesn't support full ASP.NET Core apps
        return new OkObjectResult(new { message = "API is running on Vercel" });
    }
}
