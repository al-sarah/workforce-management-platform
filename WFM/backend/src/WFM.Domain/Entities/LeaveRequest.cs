namespace WFM.Domain.Entities;

public class LeaveRequest
{
    public string Id { get; set; } = string.Empty;
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string LeaveType { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Status { get; set; } = "Pending";
    public string? Reason { get; set; }
    public List<ApprovalHistoryEntry> ApprovalHistory { get; set; } = new();
}

public class ApprovalHistoryEntry
{
    public string ChangedBy { get; set; } = string.Empty;
    public string NewStatus { get; set; } = string.Empty;
    public string? Comment { get; set; }
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
}
