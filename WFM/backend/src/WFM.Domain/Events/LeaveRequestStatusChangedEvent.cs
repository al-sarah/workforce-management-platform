namespace WFM.Domain.Events;

public class LeaveRequestStatusChangedEvent
{
    public string LeaveRequestId { get; set; } = string.Empty;
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string NewStatus { get; set; } = string.Empty;
    public string? Comment { get; set; }
    public DateTime OccurredAt { get; set; } = DateTime.UtcNow;
}
