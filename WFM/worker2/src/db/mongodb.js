const mongoose = require('mongoose');

const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.info('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error', err);
    process.exit(1);
  }
};

// Summary report schema — mirrors SummaryReportDocument in .NET
const summaryReportSchema = new mongoose.Schema({
  generatedAt: { type: Date, default: Date.now },
  totalEmployees: Number,
  activeEmployees: Number,
  totalProjects: Number,
  activeProjects: Number,
  pendingLeaveRequests: Number,
  departmentHeadcounts: [
    {
      departmentName: String,
      count: Number,
    },
  ],
  projectProgress: [
    {
      projectName: String,
      status: String,
      totalTasks: Number,
      completedTasks: Number,
    },
  ],
});

const SummaryReport = mongoose.model(
  'SummaryReport',
  summaryReportSchema,
  'summaryReports' // collection name must match what .NET uses
);

module.exports = { connectMongo, SummaryReport };
