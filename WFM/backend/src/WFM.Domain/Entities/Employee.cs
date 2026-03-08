namespace WFM.Domain.Entities;

public class Employee
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public int DepartmentId { get; set; }
    public int DesignationId { get; set; }
    public decimal Salary { get; set; }
    public DateTime JoiningDate { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    public List<string> Skills { get; set; } = new();
    public string? AvatarUrl { get; set; }

    // Navigation properties — EF Core uses these to understand relationships
    public Department Department { get; set; } = null!;
    public Designation Designation { get; set; } = null!;
    public List<ProjectEmployee> ProjectEmployees { get; set; } = new();
}
