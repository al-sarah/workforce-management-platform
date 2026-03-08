namespace WFM.Domain.Entities;

public class Designation
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    // Navigation property — one designation can belong to many employees
    public List<Employee> Employees { get; set; } = new();
}
