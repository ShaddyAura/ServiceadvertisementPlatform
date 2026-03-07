using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ServAd.ApiService.Services.Category.Interface;
using ShareLibrary.cs.Data.Entities;

[ApiController]
[Route("api/[controller]")]
public class CategoryController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoryController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    // GET: api/Category/active-categories
    [HttpGet("activecategories")]
    public async Task<IActionResult> GetActive()
    {
        var categories = await _categoryService.GetAllActiveAsync();
        return Ok(categories);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("getbyid")]
    public async Task<IActionResult> GetById(int id)
    {
        var category = await _categoryService.GetByIdAsync(id);
        return Ok(category);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("createcategory")]
    public async Task<IActionResult> Create([FromBody] ServiceCategory category)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await _categoryService.CreateAsync(category);
        return Ok(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("updatecategory")]
    public async Task<IActionResult> Update(int id, [FromBody] ServiceCategory category)
    {
        category.Id = id;
        await _categoryService.UpdateAsync(category);
        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("deletecategory")]
    public async Task<IActionResult> Delete(int id)
    {
        await _categoryService.DeleteAsync(id);
        return NoContent();
    }
}