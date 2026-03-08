using MassTransit;
using WFM.Application.Employees.DTOs;
using WFM.Domain.Entities;
using WFM.Domain.Events;
using WFM.Domain.Interfaces;

namespace WFM.Application.Employees;

public class EmployeeService
{
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IPublishEndpoint _publishEndpoint;

    public EmployeeService(
        IEmployeeRepository employeeRepository,
        IPublishEndpoint publishEndpoint)
    {
        _employeeRepository = employeeRepository;
        _publishEndpoint = publishEndpoint;
    }

    public async Task<EmployeeListDto> GetAllAsync(
        int page, int pageSize, string? search, int? departmentId, bool? isActive)
    {
        var employees = await _employeeRepository.GetAllAsync(
            page, pageSize, search, departmentId, isActive);
        var totalCount = await _employeeRepository.CountAsync(
            search, departmentId, isActive);

        return new EmployeeListDto
        {
            Items = employees.Select(MapToDto).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<EmployeeDto?> GetByIdAsync(int id)
    {
        var employee = await _employeeRepository.GetByIdAsync(id);
        return employee is null ? null : MapToDto(employee);
    }

    public async Task<EmployeeDto> CreateAsync(CreateEmployeeDto dto)
    {
        var employee = new Employee
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            DepartmentId = dto.DepartmentId,
            DesignationId = dto.DesignationId,
            Salary = dto.Salary,
            JoiningDate = dto.JoiningDate,
            Phone = dto.Phone,
            Address = dto.Address,
            City = dto.City,
            Country = dto.Country,
            Skills = dto.Skills,
            AvatarUrl = dto.AvatarUrl,
            IsActive = true
        };

        var created = await _employeeRepository.CreateAsync(employee);

        // Publish event to RabbitMQ — Worker 1 will pick this up
        await _publishEndpoint.Publish(new EmployeeCreatedEvent
        {
            EmployeeId = created.Id,
            FullName = $"{created.FirstName} {created.LastName}",
            Email = created.Email
        });

        return MapToDto(created);
    }

    public async Task<EmployeeDto?> UpdateAsync(int id, UpdateEmployeeDto dto)
    {
        var employee = await _employeeRepository.GetByIdAsync(id);
        if (employee is null) return null;

        employee.FirstName = dto.FirstName;
        employee.LastName = dto.LastName;
        employee.Email = dto.Email;
        employee.DepartmentId = dto.DepartmentId;
        employee.DesignationId = dto.DesignationId;
        employee.Salary = dto.Salary;
        employee.Phone = dto.Phone;
        employee.Address = dto.Address;
        employee.City = dto.City;
        employee.Country = dto.Country;
        employee.Skills = dto.Skills;
        employee.AvatarUrl = dto.AvatarUrl;

        var updated = await _employeeRepository.UpdateAsync(employee);

        // Publish event to RabbitMQ
        await _publishEndpoint.Publish(new EmployeeUpdatedEvent
        {
            EmployeeId = updated.Id,
            FullName = $"{updated.FirstName} {updated.LastName}",
            Email = updated.Email
        });

        return MapToDto(updated);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var employee = await _employeeRepository.GetByIdAsync(id);
        if (employee is null) return false;

        await _employeeRepository.DeleteAsync(id);

        // Publish event to RabbitMQ
        await _publishEndpoint.Publish(new EmployeeDeletedEvent
        {
            EmployeeId = id,
            FullName = $"{employee.FirstName} {employee.LastName}"
        });

        return true;
    }

    // Private helper — maps a domain entity to a DTO
    // Keeps mapping logic in one place
    private static EmployeeDto MapToDto(Employee e) => new()
    {
        Id = e.Id,
        FirstName = e.FirstName,
        LastName = e.LastName,
        Email = e.Email,
        IsActive = e.IsActive,
        DepartmentName = e.Department?.Name ?? string.Empty,
        DesignationName = e.Designation?.Name ?? string.Empty,
        Salary = e.Salary,
        JoiningDate = e.JoiningDate,
        Phone = e.Phone,
        City = e.City,
        Country = e.Country,
        Skills = e.Skills,
        AvatarUrl = e.AvatarUrl
    };
}
