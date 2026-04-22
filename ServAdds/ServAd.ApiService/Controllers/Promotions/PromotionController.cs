using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace ServAd.ApiService.Controllers.Promotions;

[ApiController]
[Route("api/[controller]")]
public class PromotionController : ControllerBase
{
    private readonly IWebHostEnvironment _env;
    private readonly string _filePath;

    public PromotionController(IWebHostEnvironment env)
    {
        _env = env;
        _filePath = Path.Combine(_env.WebRootPath, "data", "promotions.json");
    }

    // GET: api/Promotion
    [HttpGet]
    [AllowAnonymous]
    public IActionResult GetAll()
    {
        if (!System.IO.File.Exists(_filePath))
            return Ok(new List<object>());

        var json = System.IO.File.ReadAllText(_filePath);
        return Content(json, "application/json");
    }

    // POST: api/Promotion/save
    [HttpPost("save")]
    [Authorize(Roles = "Admin")]
    public IActionResult Save([FromBody] JsonElement promotions)
    {
        var dir = Path.GetDirectoryName(_filePath)!;
        if (!Directory.Exists(dir))
            Directory.CreateDirectory(dir);

        var json = promotions.GetRawText();
        System.IO.File.WriteAllText(_filePath, json);

        return Ok(new { message = "Promotions saved successfully." });
    }
}
