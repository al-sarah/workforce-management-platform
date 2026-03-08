using WFM.Domain.Entities;

namespace WFM.Domain.Interfaces;

public interface ILeaveRequestRepository
{
    Task<IEnumerable<LeaveRequest>> GetAllAsync(string? status, string? leaveType);
    Task<LeaveRequest?> GetByIdAsync(string id);
    Task<IEnumerable<LeaveRequest>> GetByEmployeeIdAsync(int employeeId);
    Task<LeaveRequest> CreateAsync(LeaveRequest document);
    Task<LeaveRequest> UpdateAsync(LeaveRequest document);
}
