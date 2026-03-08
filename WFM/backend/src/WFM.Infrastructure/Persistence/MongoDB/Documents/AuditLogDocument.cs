using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace WFM.Infrastructure.Persistence.MongoDB.Documents;

public class AuditLogDocument
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    public string EventType { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public string Actor { get; set; } = "system";
    public DateTime OccurredAt { get; set; } = DateTime.UtcNow;

    // Snapshot of what changed
    public object? Before { get; set; }
    public object? After { get; set; }
}
