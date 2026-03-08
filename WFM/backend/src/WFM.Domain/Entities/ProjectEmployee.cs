namespace WFM.Domain.Entities;

public class ProjectEmployee
{
    public int ProjectId { get; set; }
    public int EmployeeId { get; set; }

    // Navigation properties
    public Project Project { get; set; } = null!;
    public Employee Employee { get; set; } = null!;
}
