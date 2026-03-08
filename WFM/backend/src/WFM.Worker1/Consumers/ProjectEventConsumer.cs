using MassTransit;
using MongoDB.Driver;
using WFM.Domain.Events;
using WFM.Infrastructure.Persistence.MongoDB;
using WFM.Infrastructure.Persistence.MongoDB.Documents;

namespace WFM.Worker1.Consumers;

public class ProjectEventConsumer : IConsumer<ProjectStatusChangedEvent>
{
    private readonly MongoDbContext _mongoContext;
    private readonly ILogger<ProjectEventConsumer> _logger;

    public ProjectEventConsumer(
        MongoDbContext mongoContext,
        ILogger<ProjectEventConsumer> logger)
    {
        _mongoContext = mongoContext;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<ProjectStatusChangedEvent> context)
    {
        var evt = context.Message;
        _logger.LogInformation(
            "Processing ProjectStatusChanged for {ProjectId} — new status: {Status}",
            evt.ProjectId, evt.NewStatus);

        // Idempotency check
        var existing = await _mongoContext.AuditLogs
            .Find(x =>
                x.EntityId == evt.ProjectId.ToString() &&
                x.EventType == "ProjectStatusChanged" &&
                x.OccurredAt >= DateTime.UtcNow.AddSeconds(-10))
            .FirstOrDefaultAsync();

        if (existing is not null)
        {
            _logger.LogWarning(
                "Duplicate event for Project {Id} — skipping", evt.ProjectId);
            return;
        }

        var log = new AuditLogDocument
        {
            EventType = "ProjectStatusChanged",
            EntityType = "Project",
            EntityId = evt.ProjectId.ToString(),
            Actor = "system",
            OccurredAt = evt.OccurredAt,
            After = new
            {
                evt.ProjectName,
                evt.NewStatus
            }
        };

        await _mongoContext.AuditLogs.InsertOneAsync(log);
        _logger.LogInformation(
            "Audit log written for Project {Id}", evt.ProjectId);
    }
}
