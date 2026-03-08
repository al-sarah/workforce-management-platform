using Microsoft.AspNetCore.Mvc;
using WFM.Application.Projects;
using WFM.Application.Projects.DTOs;

namespace WFM.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class TasksController : ControllerBase
{
    private readonly TaskService _taskService;

    public TasksController(TaskService taskService)
    {
        _taskService = taskService;
    }

    // GET /api/v1/tasks?projectId=1
    [HttpGet]
    public async Task<IActionResult> GetByProject([FromQuery] int projectId)
    {
        var result = await _taskService.GetByProjectIdAsync(projectId);
        return Ok(result);
    }

    // GET /api/v1/tasks/5
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _taskService.GetByIdAsync(id);
        if (result is null) return NotFound();
        return Ok(result);
    }

    // POST /api/v1/tasks
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTaskDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var result = await _taskService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    // PUT /api/v1/tasks/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateTaskDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var result = await _taskService.UpdateAsync(id, dto);
        if (result is null) return NotFound();
        return Ok(result);
    }

    // DELETE /api/v1/tasks/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _taskService.DeleteAsync(id);
        if (!success) return NotFound();
        return NoContent();
    }
}
