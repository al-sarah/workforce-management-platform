using WFM.Domain.Entities;

namespace WFM.Domain.Interfaces;

public interface IEmployeeRepository
{
    Task<IEnumerable<Employee>> GetAllAsync(int page, int pageSize, string? search, int? departmentId, bool? isActive);
    Task<Employee?> GetByIdAsync(int id);
    Task<Employee> CreateAsync(Employee employee);
    Task<Employee> UpdateAsync(Employee employee);
    Task DeleteAsync(int id); // soft delete — sets IsActive = false
    Task<int> CountAsync(string? search, int? departmentId, bool? isActive);
}
