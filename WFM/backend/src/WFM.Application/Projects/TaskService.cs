using WFM.Application.Projects.DTOs;
using WFM.Domain.Entities;
using WFM.Domain.Enums;
using WFM.Domain.Interfaces;
using TaskStatusEnum = WFM.Domain.Enums.TaskStatus;

namespace WFM.Application.Projects;

public class TaskService
{
    private readonly ITaskRepository _taskRepository;

    public TaskService(ITaskRepository taskRepository)
    {
        _taskRepository = taskRepository;
    }

    public async Task<IEnumerable<TaskDto>> GetByProjectIdAsync(int projectId)
    {
        var tasks = await _taskRepository.GetByProjectIdAsync(projectId);
        return tasks.Select(MapToDto);
    }

    public async Task<TaskDto?> GetByIdAsync(int id)
    {
        var task = await _taskRepository.GetByIdAsync(id);
        return task is null ? null : MapToDto(task);
    }

    public async Task<TaskDto> CreateAsync(CreateTaskDto dto)
    {
        var task = new TaskItem
        {
            Title = dto.Title,
            Description = dto.Description,
            Priority = Enum.Parse<TaskPriority>(dto.Priority),
            DueDate = dto.DueDate,
            ProjectId = dto.ProjectId,
            AssignedEmployeeId = dto.AssignedEmployeeId,
            Status = TaskStatusEnum.Todo
        };

        var created = await _taskRepository.CreateAsync(task);
        return MapToDto(created);
    }

    public async Task<TaskDto?> UpdateAsync(int id, UpdateTaskDto dto)
    {
        var task = await _taskRepository.GetByIdAsync(id);
        if (task is null) return null;

        task.Title = dto.Title;
        task.Description = dto.Description;
        task.Status = Enum.Parse<TaskStatusEnum>(dto.Status);
        task.Priority = Enum.Parse<TaskPriority>(dto.Priority);
        task.DueDate = dto.DueDate;
        task.AssignedEmployeeId = dto.AssignedEmployeeId;

        var updated = await _taskRepository.UpdateAsync(task);
        return MapToDto(updated);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var task = await _taskRepository.GetByIdAsync(id);
        if (task is null) return false;
        await _taskRepository.DeleteAsync(id);
        return true;
    }

    private static TaskDto MapToDto(TaskItem t) => new()
    {
        Id = t.Id,
        Title = t.Title,
        Description = t.Description,
        Status = t.Status.ToString(),
        Priority = t.Priority.ToString(),
        DueDate = t.DueDate,
        ProjectId = t.ProjectId,
        AssignedEmployeeId = t.AssignedEmployeeId,
        AssignedEmployeeName = t.AssignedEmployee is null ? null
            : $"{t.AssignedEmployee.FirstName} {t.AssignedEmployee.LastName}"
    };
}
