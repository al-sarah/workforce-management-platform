namespace WFM.Domain.Events;

public class ProjectStatusChangedEvent
{
    public int ProjectId { get; set; }
    public string ProjectName { get; set; } = string.Empty;
    public string NewStatus { get; set; } = string.Empty;
    public DateTime OccurredAt { get; set; } = DateTime.UtcNow;
}
