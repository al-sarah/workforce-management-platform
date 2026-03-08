const pool = require('../db/postgres');
const { SummaryReport } = require('../db/mongodb');
const logger = require('../logger');

const generateReport = async () => {
  logger.info('Starting report generation');

  try {
    // ─── Query PostgreSQL for stats ───────────────────────────

    const totalEmployeesResult = await pool.query(
      'SELECT COUNT(*) FROM "Employees"'
    );
    const activeEmployeesResult = await pool.query(
      'SELECT COUNT(*) FROM "Employees" WHERE "IsActive" = true'
    );
    const totalProjectsResult = await pool.query(
      'SELECT COUNT(*) FROM "Projects"'
    );
    const activeProjectsResult = await pool.query(
      `SELECT COUNT(*) FROM "Projects" WHERE "Status" = 'Active'`
    );

    // Department headcount breakdown
    const departmentHeadcountResult = await pool.query(`
      SELECT d."Name" as "departmentName", COUNT(e."Id") as "count"
      FROM "Departments" d
      LEFT JOIN "Employees" e ON e."DepartmentId" = d."Id" AND e."IsActive" = true
      GROUP BY d."Name"
      ORDER BY "count" DESC
    `);

    // Project progress — task completion per project
    const projectProgressResult = await pool.query(`
      SELECT 
        p."Name" as "projectName",
        p."Status" as "status",
        COUNT(t."Id") as "totalTasks",
        COUNT(CASE WHEN t."Status" = 'Done' THEN 1 END) as "completedTasks"
      FROM "Projects" p
      LEFT JOIN "Tasks" t ON t."ProjectId" = p."Id"
      GROUP BY p."Id", p."Name", p."Status"
      ORDER BY p."Name"
    `);

    // ─── Query MongoDB for leave request stats ────────────────
    // We use mongoose directly here since SummaryReport is already connected
    const { default: mongoose } = require('mongoose');
    const db = mongoose.connection.db;
    const pendingLeaveCount = await db
      .collection('leaveRequests')
      .countDocuments({ status: 'Pending' });

    // ─── Build and save the report ────────────────────────────
    const report = new SummaryReport({
      generatedAt: new Date(),
      totalEmployees: parseInt(totalEmployeesResult.rows[0].count),
      activeEmployees: parseInt(activeEmployeesResult.rows[0].count),
      totalProjects: parseInt(totalProjectsResult.rows[0].count),
      activeProjects: parseInt(activeProjectsResult.rows[0].count),
      pendingLeaveRequests: pendingLeaveCount,
      departmentHeadcounts: departmentHeadcountResult.rows.map((row) => ({
        departmentName: row.departmentName,
        count: parseInt(row.count),
      })),
      projectProgress: projectProgressResult.rows.map((row) => ({
        projectName: row.projectName,
        status: row.status,
        totalTasks: parseInt(row.totalTasks),
        completedTasks: parseInt(row.completedTasks),
      })),
    });

    await report.save();

    logger.info('Report generated successfully', {
      totalEmployees: report.totalEmployees,
      totalProjects: report.totalProjects,
      pendingLeaveRequests: report.pendingLeaveRequests,
    });
  } catch (err) {
    logger.error('Report generation failed', { error: err.message });
  }
};

module.exports = generateReport;
