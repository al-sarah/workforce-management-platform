using MongoDB.Driver;
using WFM.Domain.Entities;
using WFM.Domain.Interfaces;
using WFM.Infrastructure.Persistence.MongoDB.Documents;
using DomainApprovalHistoryEntry = WFM.Domain.Entities.ApprovalHistoryEntry;
using DomainLeaveRequest = WFM.Domain.Entities.LeaveRequest;
using DocumentApprovalHistoryEntry = WFM.Infrastructure.Persistence.MongoDB.Documents.LeaveRequestApprovalEntry;
using LeaveRequestDocument = WFM.Infrastructure.Persistence.MongoDB.Documents.LeaveRequestDocument;

namespace WFM.Infrastructure.Persistence.MongoDB.Repositories;

public class LeaveRequestRepository : ILeaveRequestRepository
{
    private readonly MongoDbContext _context;

    public LeaveRequestRepository(MongoDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<DomainLeaveRequest>> GetAllAsync(
        string? status, string? leaveType)
    {
        var filter = Builders<LeaveRequestDocument>.Filter.Empty;

        if (!string.IsNullOrWhiteSpace(status))
            filter &= Builders<LeaveRequestDocument>.Filter.Eq(x => x.Status, status);

        if (!string.IsNullOrWhiteSpace(leaveType))
            filter &= Builders<LeaveRequestDocument>.Filter.Eq(x => x.LeaveType, leaveType);

        var documents = await _context.LeaveRequests.Find(filter).ToListAsync();
        return documents.Select(MapToDomain);
    }

    public async Task<DomainLeaveRequest?> GetByIdAsync(string id)
    {
        var document = await _context.LeaveRequests
            .Find(x => x.Id == id)
            .FirstOrDefaultAsync();

        return document is null ? null : MapToDomain(document);
    }

    public async Task<IEnumerable<DomainLeaveRequest>> GetByEmployeeIdAsync(int employeeId)
    {
        var documents = await _context.LeaveRequests
            .Find(x => x.EmployeeId == employeeId)
            .ToListAsync();

        return documents.Select(MapToDomain);
    }

    public async Task<DomainLeaveRequest> CreateAsync(DomainLeaveRequest document)
    {
        var dbDocument = MapToDocument(document);
        await _context.LeaveRequests.InsertOneAsync(dbDocument);
        return MapToDomain(dbDocument);
    }

    public async Task<DomainLeaveRequest> UpdateAsync(DomainLeaveRequest document)
    {
        var dbDocument = MapToDocument(document);
        await _context.LeaveRequests.ReplaceOneAsync(
            x => x.Id == dbDocument.Id, dbDocument);
        return MapToDomain(dbDocument);
    }

    private static DomainLeaveRequest MapToDomain(LeaveRequestDocument d) => new()
    {
        Id = d.Id,
        EmployeeId = d.EmployeeId,
        EmployeeName = d.EmployeeName,
        LeaveType = d.LeaveType,
        StartDate = d.StartDate,
        EndDate = d.EndDate,
        Status = d.Status,
        Reason = d.Reason,
        ApprovalHistory = d.ApprovalHistory.Select(MapToDomain).ToList()
    };

    private static DomainApprovalHistoryEntry MapToDomain(DocumentApprovalHistoryEntry h) => new()
    {
        ChangedBy = h.ChangedBy,
        NewStatus = h.NewStatus,
        Comment = h.Comment,
        ChangedAt = h.ChangedAt
    };

    private static LeaveRequestDocument MapToDocument(DomainLeaveRequest d) => new()
    {
        Id = d.Id,
        EmployeeId = d.EmployeeId,
        EmployeeName = d.EmployeeName,
        LeaveType = d.LeaveType,
        StartDate = d.StartDate,
        EndDate = d.EndDate,
        Status = d.Status,
        Reason = d.Reason,
        ApprovalHistory = d.ApprovalHistory.Select(MapToDocument).ToList()
    };

    private static DocumentApprovalHistoryEntry MapToDocument(DomainApprovalHistoryEntry h) => new()
    {
        ChangedBy = h.ChangedBy,
        NewStatus = h.NewStatus,
        Comment = h.Comment,
        ChangedAt = h.ChangedAt
    };
}
