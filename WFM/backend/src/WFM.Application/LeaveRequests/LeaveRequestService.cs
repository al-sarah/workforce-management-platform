using MassTransit;
using WFM.Application.LeaveRequests.DTOs;
using WFM.Domain.Entities;
using WFM.Domain.Events;
using WFM.Domain.Interfaces;

namespace WFM.Application.LeaveRequests;

public class LeaveRequestService
{
    private readonly ILeaveRequestRepository _leaveRequestRepository;
    private readonly IPublishEndpoint _publishEndpoint;

    public LeaveRequestService(
        ILeaveRequestRepository leaveRequestRepository,
        IPublishEndpoint publishEndpoint)
    {
        _leaveRequestRepository = leaveRequestRepository;
        _publishEndpoint = publishEndpoint;
    }

    public async Task<IEnumerable<LeaveRequestDto>> GetAllAsync(
        string? status, string? leaveType)
    {
        var requests = await _leaveRequestRepository.GetAllAsync(status, leaveType);
        return requests.Select(MapToDto);
    }

    public async Task<LeaveRequestDto?> GetByIdAsync(string id)
    {
        var request = await _leaveRequestRepository.GetByIdAsync(id);
        return request is null ? null : MapToDto(request);
    }

    public async Task<IEnumerable<LeaveRequestDto>> GetByEmployeeIdAsync(int employeeId)
    {
        var requests = await _leaveRequestRepository.GetByEmployeeIdAsync(employeeId);
        return requests.Select(MapToDto);
    }

    public async Task<LeaveRequestDto> CreateAsync(CreateLeaveRequestDto dto)
    {
        var document = new LeaveRequest
        {
            EmployeeId = dto.EmployeeId,
            EmployeeName = dto.EmployeeName,
            LeaveType = dto.LeaveType,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            Status = "Pending",
            Reason = dto.Reason,
            ApprovalHistory = new List<ApprovalHistoryEntry>
            {
                new()
                {
                    ChangedBy = dto.EmployeeName,
                    NewStatus = "Pending",
                    Comment = "Leave request submitted",
                    ChangedAt = DateTime.UtcNow
                }
            }
        };

        var created = await _leaveRequestRepository.CreateAsync(document);

        await _publishEndpoint.Publish(new LeaveRequestStatusChangedEvent
        {
            LeaveRequestId = created.Id,
            EmployeeId = created.EmployeeId,
            EmployeeName = created.EmployeeName,
            NewStatus = "Pending"
        });

        return MapToDto(created);
    }

    public async Task<LeaveRequestDto?> UpdateStatusAsync(
        string id, UpdateLeaveStatusDto dto)
    {
        var request = await _leaveRequestRepository.GetByIdAsync(id);
        if (request is null) return null;

        request.Status = dto.NewStatus;
        request.ApprovalHistory.Add(new ApprovalHistoryEntry
        {
            ChangedBy = dto.ChangedBy,
            NewStatus = dto.NewStatus,
            Comment = dto.Comment,
            ChangedAt = DateTime.UtcNow
        });

        var updated = await _leaveRequestRepository.UpdateAsync(request);

        await _publishEndpoint.Publish(new LeaveRequestStatusChangedEvent
        {
            LeaveRequestId = updated.Id,
            EmployeeId = updated.EmployeeId,
            EmployeeName = updated.EmployeeName,
            NewStatus = updated.Status,
            Comment = dto.Comment
        });

        return MapToDto(updated);
    }

    private static LeaveRequestDto MapToDto(LeaveRequest d) => new()
    {
        Id = d.Id,
        EmployeeId = d.EmployeeId,
        EmployeeName = d.EmployeeName,
        LeaveType = d.LeaveType,
        StartDate = d.StartDate,
        EndDate = d.EndDate,
        Status = d.Status,
        Reason = d.Reason,
        ApprovalHistory = d.ApprovalHistory.Select(h => new ApprovalHistoryDto
        {
            ChangedBy = h.ChangedBy,
            NewStatus = h.NewStatus,
            Comment = h.Comment,
            ChangedAt = h.ChangedAt
        }).ToList()
    };
}
