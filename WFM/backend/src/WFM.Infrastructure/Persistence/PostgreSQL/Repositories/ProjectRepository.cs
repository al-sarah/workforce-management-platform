using Microsoft.EntityFrameworkCore;
using WFM.Domain.Entities;
using WFM.Domain.Interfaces;

namespace WFM.Infrastructure.Persistence.PostgreSQL.Repositories;

public class ProjectRepository : IProjectRepository
{
    private readonly AppDbContext _context;

    public ProjectRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Project>> GetAllAsync()
    {
        return await _context.Projects
            .Include(p => p.ProjectEmployees)
                .ThenInclude(pe => pe.Employee)
            .Include(p => p.Tasks)
            .ToListAsync();
    }

    public async Task<Project?> GetByIdAsync(int id)
    {
        return await _context.Projects
            .Include(p => p.ProjectEmployees)
                .ThenInclude(pe => pe.Employee)
            .Include(p => p.Tasks)
                .ThenInclude(t => t.AssignedEmployee)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Project> CreateAsync(Project project)
    {
        _context.Projects.Add(project);
        await _context.SaveChangesAsync();
        return project;
    }

    public async Task<Project> UpdateAsync(Project project)
    {
        _context.Projects.Update(project);
        await _context.SaveChangesAsync();
        return project;
    }

    public async Task DeleteAsync(int id)
    {
        var project = await _context.Projects.FindAsync(id);
        if (project is null) return;
        _context.Projects.Remove(project);
        await _context.SaveChangesAsync();
    }
}
