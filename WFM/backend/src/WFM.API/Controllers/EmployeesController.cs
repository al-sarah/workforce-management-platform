using Microsoft.AspNetCore.Mvc;
using WFM.Application.Employees;
using WFM.Application.Employees.DTOs;

namespace WFM.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class EmployeesController : ControllerBase
{
    private readonly EmployeeService _employeeService;

    public EmployeesController(EmployeeService employeeService)
    {
        _employeeService = employeeService;
    }

    // GET /api/v1/employees?page=1&pageSize=10&search=john&departmentId=1&isActive=true
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] int? departmentId = null,
        [FromQuery] bool? isActive = null)
    {
        var result = await _employeeService.GetAllAsync(
            page, pageSize, search, departmentId, isActive);
        return Ok(result);
    }

    // GET /api/v1/employees/5
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _employeeService.GetByIdAsync(id);
        if (result is null) return NotFound();
        return Ok(result);
    }

    // POST /api/v1/employees
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateEmployeeDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var result = await _employeeService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    // PUT /api/v1/employees/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateEmployeeDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var result = await _employeeService.UpdateAsync(id, dto);
        if (result is null) return NotFound();
        return Ok(result);
    }

    // DELETE /api/v1/employees/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _employeeService.DeleteAsync(id);
        if (!success) return NotFound();
        return NoContent();
    }
}
