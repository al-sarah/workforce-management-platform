using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WFM.Infrastructure.Persistence.PostgreSQL;

namespace WFM.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class DesignationsController : ControllerBase
{
    private readonly AppDbContext _context;

    public DesignationsController(AppDbContext context)
    {
        _context = context;
    }

    // GET /api/v1/designations
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var designations = await _context.Designations.ToListAsync();
        return Ok(designations);
    }
}
