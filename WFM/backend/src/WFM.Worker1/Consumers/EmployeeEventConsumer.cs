using MassTransit;
using MongoDB.Driver;
using WFM.Domain.Events;
using WFM.Infrastructure.Persistence.MongoDB;
using WFM.Infrastructure.Persistence.MongoDB.Documents;

namespace WFM.Worker1.Consumers;

public class EmployeeEventConsumer :
    IConsumer<EmployeeCreatedEvent>,
    IConsumer<EmployeeUpdatedEvent>,
    IConsumer<EmployeeDeletedEvent>
{
    private readonly MongoDbContext _mongoContext;
    private readonly ILogger<EmployeeEventConsumer> _logger;

    public EmployeeEventConsumer(
        MongoDbContext mongoContext,
        ILogger<EmployeeEventConsumer> logger)
    {
        _mongoContext = mongoContext;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<EmployeeCreatedEvent> context)
    {
        var evt = context.Message;
        _logger.LogInformation(
            "Processing EmployeeCreated event for {EmployeeId}", evt.EmployeeId);

        await WriteAuditLog(
            eventType: "EmployeeCreated",
            entityType: "Employee",
            entityId: evt.EmployeeId.ToString(),
            actor: "system",
            after: new { evt.EmployeeId, evt.FullName, evt.Email }
        );
    }

    public async Task Consume(ConsumeContext<EmployeeUpdatedEvent> context)
    {
        var evt = context.Message;
        _logger.LogInformation(
            "Processing EmployeeUpdated event for {EmployeeId}", evt.EmployeeId);

        await WriteAuditLog(
            eventType: "EmployeeUpdated",
            entityType: "Employee",
            entityId: evt.EmployeeId.ToString(),
            actor: "system",
            after: new { evt.EmployeeId, evt.FullName, evt.Email }
        );
    }

    public async Task Consume(ConsumeContext<EmployeeDeletedEvent> context)
    {
        var evt = context.Message;
        _logger.LogInformation(
            "Processing EmployeeDeleted event for {EmployeeId}", evt.EmployeeId);

        await WriteAuditLog(
            eventType: "EmployeeDeleted",
            entityType: "Employee",
            entityId: evt.EmployeeId.ToString(),
            actor: "system",
            before: new { evt.EmployeeId, evt.FullName }
        );
    }

    private async Task WriteAuditLog(
        string eventType,
        string entityType,
        string entityId,
        string actor,
        object? before = null,
        object? after = null)
    {
        // Idempotency check — don't write duplicate audit logs
        // for the same entity + event type + timestamp window
        var existing = await _mongoContext.AuditLogs
            .Find(x =>
                x.EntityId == entityId &&
                x.EventType == eventType &&
                x.OccurredAt >= DateTime.UtcNow.AddSeconds(-10))
            .FirstOrDefaultAsync();

        if (existing is not null)
        {
            _logger.LogWarning(
                "Duplicate event detected for {EventType} {EntityId} — skipping",
                eventType, entityId);
            return;
        }

        var log = new AuditLogDocument
        {
            EventType = eventType,
            EntityType = entityType,
            EntityId = entityId,
            Actor = actor,
            OccurredAt = DateTime.UtcNow,
            Before = before,
            After = after
        };

        await _mongoContext.AuditLogs.InsertOneAsync(log);
        _logger.LogInformation(
            "Audit log written for {EventType} {EntityId}", eventType, entityId);
    }
}
