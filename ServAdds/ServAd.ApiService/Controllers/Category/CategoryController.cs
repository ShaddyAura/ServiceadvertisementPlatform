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

    // GET: api/Category/get-by-id/5
    [HttpGet("getbyid")]
    public async Task<IActionResult> GetById(int id)
    {
        var category = await _categoryService.GetByIdAsync(id);
        return Ok(category);
    }

    // POST: api/Category/create-category
    [HttpPost("createcategory")]
    public async Task<IActionResult> Create([FromBody] ServiceCategory category)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await _categoryService.CreateAsync(category);
        return Ok(result);
    }

    // PUT: api/Category/update-category/5
    [HttpPut("updatecategory")]
    public async Task<IActionResult> Update(int id, [FromBody] ServiceCategory category)
    {
        category.Id = id;
        await _categoryService.UpdateAsync(category);
        return NoContent();
    }

    // DELETE: api/Category/delete-category/5
    [HttpDelete("deletecategory")]
    public async Task<IActionResult> Delete(int id)
    {
        await _categoryService.DeleteAsync(id);
        return NoContent();
    }
}