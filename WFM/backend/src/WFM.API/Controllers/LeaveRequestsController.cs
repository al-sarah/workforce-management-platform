using Microsoft.AspNetCore.Mvc;
using WFM.Application.LeaveRequests;
using WFM.Application.LeaveRequests.DTOs;

namespace WFM.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class LeaveRequestsController : ControllerBase
{
    private readonly LeaveRequestService _leaveRequestService;

    public LeaveRequestsController(LeaveRequestService leaveRequestService)
    {
        _leaveRequestService = leaveRequestService;
    }

    // GET /api/v1/leaverequests?status=Pending&leaveType=Annual
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? status = null,
        [FromQuery] string? leaveType = null)
    {
        var result = await _leaveRequestService.GetAllAsync(status, leaveType);
        return Ok(result);
    }

    // GET /api/v1/leaverequests/abc123
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var result = await _leaveRequestService.GetByIdAsync(id);
        if (result is null) return NotFound();
        return Ok(result);
    }

    // GET /api/v1/leaverequests/employee/5
    [HttpGet("employee/{employeeId}")]
    public async Task<IActionResult> GetByEmployee(int employeeId)
    {
        var result = await _leaveRequestService.GetByEmployeeIdAsync(employeeId);
        return Ok(result);
    }

    // POST /api/v1/leaverequests
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateLeaveRequestDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var result = await _leaveRequestService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    // PATCH /api/v1/leaverequests/abc123/status
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(
        string id, [FromBody] UpdateLeaveStatusDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var result = await _leaveRequestService.UpdateStatusAsync(id, dto);
        if (result is null) return NotFound();
        return Ok(result);
    }
}
