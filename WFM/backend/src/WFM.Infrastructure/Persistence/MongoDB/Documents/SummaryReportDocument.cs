using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace WFM.Infrastructure.Persistence.MongoDB.Documents;

[BsonIgnoreExtraElements]
public class SummaryReportDocument
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("generatedAt")]
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    [BsonElement("totalEmployees")]
    public int TotalEmployees { get; set; }
    [BsonElement("activeEmployees")]
    public int ActiveEmployees { get; set; }
    [BsonElement("totalProjects")]
    public int TotalProjects { get; set; }
    [BsonElement("activeProjects")]
    public int ActiveProjects { get; set; }
    [BsonElement("pendingLeaveRequests")]
    public int PendingLeaveRequests { get; set; }
    [BsonElement("departmentHeadcounts")]
    public List<DepartmentHeadcount> DepartmentHeadcounts { get; set; } = new();
    [BsonElement("projectProgress")]
    public List<ProjectProgress> ProjectProgress { get; set; } = new();
}

[BsonIgnoreExtraElements]
public class DepartmentHeadcount
{
    [BsonElement("departmentName")]
    public string DepartmentName { get; set; } = string.Empty;
    [BsonElement("count")]
    public int Count { get; set; }
}

[BsonIgnoreExtraElements]
public class ProjectProgress
{
    [BsonElement("projectName")]
    public string ProjectName { get; set; } = string.Empty;
    [BsonElement("status")]
    public string Status { get; set; } = string.Empty;
    [BsonElement("totalTasks")]
    public int TotalTasks { get; set; }
    [BsonElement("completedTasks")]
    public int CompletedTasks { get; set; }
}
