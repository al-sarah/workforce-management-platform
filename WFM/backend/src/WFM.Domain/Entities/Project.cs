using WFM.Domain.Enums;

namespace WFM.Domain.Entities;

public class Project
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ProjectStatus Status { get; set; } = ProjectStatus.Active;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }

    // Navigation properties
    public List<ProjectEmployee> ProjectEmployees { get; set; } = new();
    public List<TaskItem> Tasks { get; set; } = new();
}
