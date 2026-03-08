using MongoDB.Driver;
using WFM.Infrastructure.Persistence.MongoDB.Documents;

namespace WFM.Infrastructure.Persistence.MongoDB;

public class MongoDbContext
{
    private readonly IMongoDatabase _database;

    public MongoDbContext(IMongoClient client, string databaseName)
    {
        _database = client.GetDatabase(databaseName);
    }

    public IMongoCollection<LeaveRequestDocument> LeaveRequests =>
        _database.GetCollection<LeaveRequestDocument>("leaveRequests");

    public IMongoCollection<AuditLogDocument> AuditLogs =>
        _database.GetCollection<AuditLogDocument>("auditLogs");

    public IMongoCollection<SummaryReportDocument> SummaryReports =>
        _database.GetCollection<SummaryReportDocument>("summaryReports");
}
