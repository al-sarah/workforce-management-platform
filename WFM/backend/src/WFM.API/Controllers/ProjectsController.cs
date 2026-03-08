using Microsoft.AspNetCore.Mvc;
using WFM.Application.Projects;
using WFM.Application.Projects.DTOs;

namespace WFM.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class ProjectsController : ControllerBase
{
    private readonly ProjectService _projectService;

    public ProjectsController(ProjectService projectService)
    {
        _projectService = projectService;
    }

    // GET /api/v1/projects
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _projectService.GetAllAsync();
        return Ok(result);
    }

    // GET /api/v1/projects/5
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _projectService.GetByIdAsync(id);
        if (result is null) return NotFound();
        return Ok(result);
    }

    // POST /api/v1/projects
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProjectDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var result = await _projectService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    // PUT /api/v1/projects/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateProjectDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var result = await _projectService.UpdateAsync(id, dto);
        if (result is null) return NotFound();
        return Ok(result);
    }

    // DELETE /api/v1/projects/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _projectService.DeleteAsync(id);
        if (!success) return NotFound();
        return NoContent();
    }
}
