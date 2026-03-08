using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using WFM.Infrastructure.Persistence.MongoDB;
using WFM.Infrastructure.Persistence.MongoDB.Documents;

namespace WFM.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class AuditLogsController : ControllerBase
{
    private readonly MongoDbContext _mongoContext;

    public AuditLogsController(MongoDbContext mongoContext)
    {
        _mongoContext = mongoContext;
    }

    // GET /api/v1/auditlogs?entityType=Employee&entityId=5
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? entityType = null,
        [FromQuery] string? entityId = null)
    {
        var filter = Builders<AuditLogDocument>.Filter.Empty;

        if (!string.IsNullOrWhiteSpace(entityType))
            filter &= Builders<AuditLogDocument>.Filter
                .Eq(x => x.EntityType, entityType);

        if (!string.IsNullOrWhiteSpace(entityId))
            filter &= Builders<AuditLogDocument>.Filter
                .Eq(x => x.EntityId, entityId);

        var logs = await _mongoContext.AuditLogs
            .Find(filter)
            .SortByDescending(x => x.OccurredAt)
            .Limit(100)
            .ToListAsync();

        return Ok(logs);
    }
}
