using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace WFM.Infrastructure.Persistence.MongoDB.Documents;

public class SummaryReportDocument
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    public int TotalEmployees { get; set; }
    public int ActiveEmployees { get; set; }
    public int TotalProjects { get; set; }
    public int ActiveProjects { get; set; }
    public int PendingLeaveRequests { get; set; }
    public List<DepartmentHeadcount> DepartmentHeadcounts { get; set; } = new();
    public List<ProjectProgress> ProjectProgress { get; set; } = new();
}

public class DepartmentHeadcount
{
    public string DepartmentName { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class ProjectProgress
{
    public string ProjectName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
}
