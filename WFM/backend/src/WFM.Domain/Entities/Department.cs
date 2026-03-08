namespace WFM.Domain.Entities;

public class Department
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    // Navigation property — one department has many employees
    public List<Employee> Employees { get; set; } = new();
}
