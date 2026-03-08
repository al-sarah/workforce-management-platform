using MassTransit;
using WFM.Application.Projects.DTOs;
using WFM.Domain.Entities;
using WFM.Domain.Enums;
using WFM.Domain.Events;
using WFM.Domain.Interfaces;

namespace WFM.Application.Projects;

public class ProjectService
{
    private readonly IProjectRepository _projectRepository;
    private readonly IPublishEndpoint _publishEndpoint;

    public ProjectService(
        IProjectRepository projectRepository,
        IPublishEndpoint publishEndpoint)
    {
        _projectRepository = projectRepository;
        _publishEndpoint = publishEndpoint;
    }

    public async Task<IEnumerable<ProjectDto>> GetAllAsync()
    {
        var projects = await _projectRepository.GetAllAsync();
        return projects.Select(MapToDto);
    }

    public async Task<ProjectDto?> GetByIdAsync(int id)
    {
        var project = await _projectRepository.GetByIdAsync(id);
        return project is null ? null : MapToDto(project);
    }

    public async Task<ProjectDto> CreateAsync(CreateProjectDto dto)
    {
        var project = new Project
        {
            Name = dto.Name,
            Description = dto.Description,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            Status = ProjectStatus.Active,
            ProjectEmployees = dto.TeamMemberIds.Select(id => new ProjectEmployee
            {
                EmployeeId = id
            }).ToList()
        };

        var created = await _projectRepository.CreateAsync(project);

        await _publishEndpoint.Publish(new ProjectStatusChangedEvent
        {
            ProjectId = created.Id,
            ProjectName = created.Name,
            NewStatus = created.Status.ToString()
        });

        return MapToDto(created);
    }

    public async Task<ProjectDto?> UpdateAsync(int id, UpdateProjectDto dto)
    {
        var project = await _projectRepository.GetByIdAsync(id);
        if (project is null) return null;

        project.Name = dto.Name;
        project.Description = dto.Description;
        project.StartDate = dto.StartDate;
        project.EndDate = dto.EndDate;
        project.Status = Enum.Parse<ProjectStatus>(dto.Status);
        project.ProjectEmployees = dto.TeamMemberIds.Select(empId => new ProjectEmployee
        {
            ProjectId = id,
            EmployeeId = empId
        }).ToList();

        var updated = await _projectRepository.UpdateAsync(project);

        await _publishEndpoint.Publish(new ProjectStatusChangedEvent
        {
            ProjectId = updated.Id,
            ProjectName = updated.Name,
            NewStatus = updated.Status.ToString()
        });

        return MapToDto(updated);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var project = await _projectRepository.GetByIdAsync(id);
        if (project is null) return false;
        await _projectRepository.DeleteAsync(id);
        return true;
    }

    private static ProjectDto MapToDto(Project p) => new()
    {
        Id = p.Id,
        Name = p.Name,
        Description = p.Description,
        Status = p.Status.ToString(),
        StartDate = p.StartDate,
        EndDate = p.EndDate,
        TeamMembers = p.ProjectEmployees.Select(pe => new ProjectMemberDto
        {
            EmployeeId = pe.EmployeeId,
            FullName = pe.Employee is null ? string.Empty
                : $"{pe.Employee.FirstName} {pe.Employee.LastName}",
            AvatarUrl = pe.Employee?.AvatarUrl
        }).ToList(),
        TotalTasks = p.Tasks.Count,
        CompletedTasks = p.Tasks.Count(t => t.Status == WFM.Domain.Enums.TaskStatus.Done)
    };
}
