using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WFM.Domain.Entities;
using WFM.Domain.Enums;

namespace WFM.Infrastructure.Persistence.PostgreSQL.Configurations;

public class ProjectConfiguration : IEntityTypeConfiguration<Project>
{
    public void Configure(EntityTypeBuilder<Project> builder)
    {
        builder.ToTable("Projects");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.Description)
            .HasMaxLength(1000);

        // Store enum as string so the DB is readable
        // e.g. "Active" instead of 0
        builder.Property(p => p.Status)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(p => p.StartDate)
            .IsRequired();

        // EndDate is nullable — ongoing projects have no end date
        builder.Property(p => p.EndDate)
            .IsRequired(false);
    }
}
