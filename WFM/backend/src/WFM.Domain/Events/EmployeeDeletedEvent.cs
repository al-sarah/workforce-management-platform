namespace WFM.Domain.Events;

public class EmployeeDeletedEvent
{
    public int EmployeeId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public DateTime OccurredAt { get; set; } = DateTime.UtcNow;
}
