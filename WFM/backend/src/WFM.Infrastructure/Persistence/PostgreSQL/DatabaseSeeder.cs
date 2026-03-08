using Microsoft.EntityFrameworkCore;
using MongoDB.Driver;
using WFM.Domain.Entities;
using WFM.Domain.Enums;
using WFM.Infrastructure.Persistence.MongoDB;
using WFM.Infrastructure.Persistence.MongoDB.Documents;

namespace WFM.Infrastructure.Persistence.PostgreSQL;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(
        AppDbContext context,
        MongoDbContext mongoContext)
    {
        // Only seed if the database is empty
        if (await context.Departments.AnyAsync()) return;

        // ─── Departments ─────────────────────────────────────
        var departments = new List<Department>
        {
            new() { Name = "Engineering", Description = "Software development and architecture" },
            new() { Name = "Product", Description = "Product management and design" },
            new() { Name = "Marketing", Description = "Marketing and growth" },
            new() { Name = "Sales", Description = "Sales and business development" },
            new() { Name = "HR", Description = "Human resources and recruitment" },
            new() { Name = "Finance", Description = "Finance and accounting" },
            new() { Name = "Operations", Description = "Operations and logistics" },
            new() { Name = "Customer Support", Description = "Customer success and support" },
        };

        context.Departments.AddRange(departments);
        await context.SaveChangesAsync();

        // ─── Designations ─────────────────────────────────────
        var designations = new List<Designation>
        {
            new() { Name = "Junior Software Engineer", Description = "Entry level engineer" },
            new() { Name = "Software Engineer", Description = "Mid level engineer" },
            new() { Name = "Senior Software Engineer", Description = "Senior engineer" },
            new() { Name = "Lead Engineer", Description = "Tech lead" },
            new() { Name = "Engineering Manager", Description = "Engineering manager" },
            new() { Name = "Product Manager", Description = "Product manager" },
            new() { Name = "Designer", Description = "UI/UX designer" },
            new() { Name = "Marketing Manager", Description = "Marketing manager" },
            new() { Name = "Sales Executive", Description = "Sales executive" },
            new() { Name = "HR Manager", Description = "HR manager" },
            new() { Name = "Finance Manager", Description = "Finance manager" },
            new() { Name = "Operations Manager", Description = "Operations manager" },
            new() { Name = "Support Specialist", Description = "Customer support specialist" },
        };

        context.Designations.AddRange(designations);
        await context.SaveChangesAsync();

        // ─── Employees ────────────────────────────────────────
        var random = new Random(42); // fixed seed for reproducibility

        var firstNames = new[]
        {
            "James", "Sarah", "Michael", "Emily", "David", "Jessica",
            "Daniel", "Ashley", "Matthew", "Amanda", "Christopher", "Stephanie",
            "Andrew", "Melissa", "Joshua", "Nicole", "Ryan", "Elizabeth",
            "Brandon", "Hannah", "Tyler", "Samantha", "Justin", "Rachel",
            "Kevin", "Lauren", "Jason", "Megan", "Eric", "Amy",
            "Adam", "Heather", "Jonathan", "Brittany", "Nathan", "Amber",
            "Robert", "Danielle", "William", "Rebecca", "Thomas", "Michelle",
            "Charles", "Laura", "Joseph", "Kimberly", "Benjamin", "Christina",
            "Samuel", "Tiffany", "Alexander", "Natalie"
        };

        var lastNames = new[]
        {
            "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia",
            "Miller", "Davis", "Wilson", "Anderson", "Taylor", "Thomas",
            "Jackson", "White", "Harris", "Martin", "Thompson", "Moore",
            "Young", "Allen", "King", "Wright", "Scott", "Torres",
            "Hill", "Green", "Adams", "Nelson", "Baker", "Hall",
            "Rivera", "Campbell", "Mitchell", "Carter", "Roberts", "Phillips",
            "Evans", "Turner", "Parker", "Collins", "Edwards", "Stewart",
            "Flores", "Morris", "Nguyen", "Murphy", "Cook", "Rogers",
            "Morgan", "Peterson", "Cooper", "Reed"
        };

        var cities = new[]
        {
            "Singapore", "Kuala Lumpur", "Jakarta", "Bangkok", "Manila",
            "Ho Chi Minh City", "Sydney", "Melbourne", "Tokyo", "Seoul"
        };

        var skillSets = new[]
        {
            new List<string> { "C#", ".NET", "SQL", "Azure" },
            new List<string> { "React", "TypeScript", "CSS", "HTML" },
            new List<string> { "Python", "Machine Learning", "TensorFlow" },
            new List<string> { "Java", "Spring Boot", "Microservices" },
            new List<string> { "Product Management", "Agile", "Scrum" },
            new List<string> { "Figma", "Adobe XD", "UI/UX" },
            new List<string> { "Marketing", "SEO", "Google Analytics" },
            new List<string> { "Sales", "CRM", "Negotiation" },
            new List<string> { "HR", "Recruitment", "Payroll" },
            new List<string> { "Finance", "Excel", "Accounting" },
        };

        var employees = new List<Employee>();

        for (int i = 0; i < 52; i++)
        {
            var firstName = firstNames[i % firstNames.Length];
            var lastName = lastNames[i % lastNames.Length];
            var dept = departments[i % departments.Count];
            var desig = designations[i % designations.Count];

            employees.Add(new Employee
            {
                FirstName = firstName,
                LastName = lastName,
                Email = $"{firstName.ToLower()}.{lastName.ToLower()}{i}@company.com",
                IsActive = i % 10 != 0, // 10% inactive
                DepartmentId = dept.Id,
                DesignationId = desig.Id,
                Salary = 3000 + (random.Next(1, 15) * 500),
                JoiningDate = DateTime.UtcNow.AddDays(-random.Next(30, 1500)),
                Phone = $"+65 9{random.Next(1000000, 9999999)}",
                City = cities[i % cities.Length],
                Country = "Singapore",
                Skills = skillSets[i % skillSets.Length],
                AvatarUrl = $"https://i.pravatar.cc/150?img={(i % 70) + 1}"
            });
        }

        context.Employees.AddRange(employees);
        await context.SaveChangesAsync();

        // ─── Projects ─────────────────────────────────────────
        var projects = new List<Project>
        {
            new()
            {
                Name = "Workforce Portal v2",
                Description = "Rebuild of the internal workforce management portal",
                Status = ProjectStatus.Active,
                StartDate = DateTime.UtcNow.AddMonths(-3),
                EndDate = DateTime.UtcNow.AddMonths(3),
                ProjectEmployees = new List<ProjectEmployee>
                {
                    new() { EmployeeId = employees[0].Id },
                    new() { EmployeeId = employees[1].Id },
                    new() { EmployeeId = employees[2].Id },
                    new() { EmployeeId = employees[3].Id },
                }
            },
            new()
            {
                Name = "Mobile App Launch",
                Description = "iOS and Android app for employee self-service",
                Status = ProjectStatus.Active,
                StartDate = DateTime.UtcNow.AddMonths(-1),
                EndDate = DateTime.UtcNow.AddMonths(5),
                ProjectEmployees = new List<ProjectEmployee>
                {
                    new() { EmployeeId = employees[4].Id },
                    new() { EmployeeId = employees[5].Id },
                    new() { EmployeeId = employees[6].Id },
                }
            },
            new()
            {
                Name = "Data Migration",
                Description = "Migrate legacy data to new platform",
                Status = ProjectStatus.OnHold,
                StartDate = DateTime.UtcNow.AddMonths(-6),
                EndDate = DateTime.UtcNow.AddMonths(1),
                ProjectEmployees = new List<ProjectEmployee>
                {
                    new() { EmployeeId = employees[7].Id },
                    new() { EmployeeId = employees[8].Id },
                }
            },
            new()
            {
                Name = "Security Audit",
                Description = "Annual security audit and penetration testing",
                Status = ProjectStatus.Completed,
                StartDate = DateTime.UtcNow.AddMonths(-4),
                EndDate = DateTime.UtcNow.AddMonths(-1),
                ProjectEmployees = new List<ProjectEmployee>
                {
                    new() { EmployeeId = employees[9].Id },
                    new() { EmployeeId = employees[10].Id },
                }
            },
            new()
            {
                Name = "AI Chatbot Integration",
                Description = "Integrate AI assistant into the support portal",
                Status = ProjectStatus.Active,
                StartDate = DateTime.UtcNow.AddMonths(-2),
                EndDate = DateTime.UtcNow.AddMonths(4),
                ProjectEmployees = new List<ProjectEmployee>
                {
                    new() { EmployeeId = employees[11].Id },
                    new() { EmployeeId = employees[12].Id },
                    new() { EmployeeId = employees[13].Id },
                }
            },
        };

        context.Projects.AddRange(projects);
        await context.SaveChangesAsync();

        // ─── Tasks ────────────────────────────────────────────
        var tasks = new List<TaskItem>();

        foreach (var project in projects)
        {
            var projectEmployeeIds = project.ProjectEmployees
                .Select(pe => pe.EmployeeId)
                .ToList();

            tasks.AddRange(new[]
            {
                new TaskItem
                {
                    Title = "Requirements gathering",
                    Description = "Gather and document all requirements",
                    Status = Domain.Enums.TaskStatus.Done,
                    Priority = TaskPriority.High,
                    DueDate = DateTime.UtcNow.AddDays(-30),
                    ProjectId = project.Id,
                    AssignedEmployeeId = projectEmployeeIds[0]
                },
                new TaskItem
                {
                    Title = "System design",
                    Description = "Create system architecture and design docs",
                    Status = Domain.Enums.TaskStatus.Done,
                    Priority = TaskPriority.High,
                    DueDate = DateTime.UtcNow.AddDays(-20),
                    ProjectId = project.Id,
                    AssignedEmployeeId = projectEmployeeIds[0]
                },
                new TaskItem
                {
                    Title = "Backend API development",
                    Description = "Build REST API endpoints",
                    Status = Domain.Enums.TaskStatus.InProgress,
                    Priority = TaskPriority.High,
                    DueDate = DateTime.UtcNow.AddDays(10),
                    ProjectId = project.Id,
                    AssignedEmployeeId = projectEmployeeIds.Count > 1
                        ? projectEmployeeIds[1] : projectEmployeeIds[0]
                },
                new TaskItem
                {
                    Title = "Frontend development",
                    Description = "Build UI components and pages",
                    Status = Domain.Enums.TaskStatus.InProgress,
                    Priority = TaskPriority.Medium,
                    DueDate = DateTime.UtcNow.AddDays(15),
                    ProjectId = project.Id,
                    AssignedEmployeeId = projectEmployeeIds.Count > 2
                        ? projectEmployeeIds[2] : projectEmployeeIds[0]
                },
                new TaskItem
                {
                    Title = "Testing and QA",
                    Description = "Write and run test cases",
                    Status = Domain.Enums.TaskStatus.Todo,
                    Priority = TaskPriority.Medium,
                    DueDate = DateTime.UtcNow.AddDays(25),
                    ProjectId = project.Id,
                    AssignedEmployeeId = projectEmployeeIds.Count > 3
                        ? projectEmployeeIds[3] : projectEmployeeIds[0]
                },
                new TaskItem
                {
                    Title = "Deployment and go-live",
                    Description = "Deploy to production and monitor",
                    Status = Domain.Enums.TaskStatus.Todo,
                    Priority = TaskPriority.Critical,
                    DueDate = DateTime.UtcNow.AddDays(35),
                    ProjectId = project.Id,
                    AssignedEmployeeId = projectEmployeeIds[0]
                },
            });
        }

        context.Tasks.AddRange(tasks);
        await context.SaveChangesAsync();

        // ─── MongoDB — Leave Requests ─────────────────────────
        var leaveTypes = new[] { "Annual", "Sick", "Casual", "Unpaid" };
        var statuses = new[] { "Pending", "Approved", "Rejected" };

        var leaveRequests = new List<LeaveRequestDocument>();

        for (int i = 0; i < 60; i++)
        {
            var employee = employees[i % employees.Count];
            var status = statuses[i % statuses.Length];
            var startDate = DateTime.UtcNow.AddDays(-random.Next(1, 60));
            var endDate = startDate.AddDays(random.Next(1, 7));

            var approvalHistory = new List<LeaveRequestApprovalEntry>
            {
                new()
                {
                    ChangedBy = $"{employee.FirstName} {employee.LastName}",
                    NewStatus = "Pending",
                    Comment = "Leave request submitted",
                    ChangedAt = startDate.AddDays(-3)
                }
            };

            if (status != "Pending")
            {
                approvalHistory.Add(new LeaveRequestApprovalEntry
                {
                    ChangedBy = "HR Manager",
                    NewStatus = status,
                    Comment = status == "Approved"
                        ? "Approved. Enjoy your leave."
                        : "Rejected due to project deadline.",
                    ChangedAt = startDate.AddDays(-1)
                });
            }

            leaveRequests.Add(new LeaveRequestDocument
            {
                EmployeeId = employee.Id,
                EmployeeName = $"{employee.FirstName} {employee.LastName}",
                LeaveType = leaveTypes[i % leaveTypes.Length],
                StartDate = startDate,
                EndDate = endDate,
                Status = status,
                Reason = $"Personal leave request #{i + 1}",
                ApprovalHistory = approvalHistory
            });
        }

        await mongoContext.LeaveRequests.InsertManyAsync(leaveRequests);
    }
}
