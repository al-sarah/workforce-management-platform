using MassTransit;
using MongoDB.Driver;
using WFM.Domain.Events;
using WFM.Infrastructure.Persistence.MongoDB;
using WFM.Infrastructure.Persistence.MongoDB.Documents;

namespace WFM.Worker1.Consumers;

public class LeaveRequestEventConsumer : IConsumer<LeaveRequestStatusChangedEvent>
{
    private readonly MongoDbContext _mongoContext;
    private readonly ILogger<LeaveRequestEventConsumer> _logger;

    public LeaveRequestEventConsumer(
        MongoDbContext mongoContext,
        ILogger<LeaveRequestEventConsumer> logger)
    {
        _mongoContext = mongoContext;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<LeaveRequestStatusChangedEvent> context)
    {
        var evt = context.Message;
        _logger.LogInformation(
            "Processing LeaveRequestStatusChanged for {LeaveRequestId} — new status: {Status}",
            evt.LeaveRequestId, evt.NewStatus);

        // Idempotency check
        var existing = await _mongoContext.AuditLogs
            .Find(x =>
                x.EntityId == evt.LeaveRequestId &&
                x.EventType == "LeaveRequestStatusChanged" &&
                x.OccurredAt >= DateTime.UtcNow.AddSeconds(-10))
            .FirstOrDefaultAsync();

        if (existing is not null)
        {
            _logger.LogWarning(
                "Duplicate event for LeaveRequest {Id} — skipping", evt.LeaveRequestId);
            return;
        }

        var log = new AuditLogDocument
        {
            EventType = "LeaveRequestStatusChanged",
            EntityType = "LeaveRequest",
            EntityId = evt.LeaveRequestId,
            Actor = evt.EmployeeName,
            OccurredAt = evt.OccurredAt,
            After = new
            {
                evt.NewStatus,
                evt.Comment,
                evt.EmployeeName
            }
        };

        await _mongoContext.AuditLogs.InsertOneAsync(log);
        _logger.LogInformation(
            "Audit log written for LeaveRequest {Id}", evt.LeaveRequestId);
    }
}
