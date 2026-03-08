using WFM.Domain.Enums;
using TaskStatusEnum = WFM.Domain.Enums.TaskStatus;

namespace WFM.Domain.Entities;

public class TaskItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TaskStatusEnum Status { get; set; } = TaskStatusEnum.Todo;
    public TaskPriority Priority { get; set; } = TaskPriority.Medium;
    public DateTime? DueDate { get; set; }
    public int ProjectId { get; set; }
    public int? AssignedEmployeeId { get; set; }

    // Navigation properties
    public Project Project { get; set; } = null!;
    public Employee? AssignedEmployee { get; set; }
}
