using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace WFM.Infrastructure.Persistence.MongoDB.Documents;

public class LeaveRequestDocument
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string LeaveType { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Status { get; set; } = "Pending";
    public string? Reason { get; set; }

    // Full approval history embedded inside the document
    public List<LeaveRequestApprovalEntry> ApprovalHistory { get; set; } = new();
}

public class LeaveRequestApprovalEntry
{
    public string ChangedBy { get; set; } = string.Empty;
    public string NewStatus { get; set; } = string.Empty;
    public string? Comment { get; set; }
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
}
