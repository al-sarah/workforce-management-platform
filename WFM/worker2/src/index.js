const cron = require('node-cron');
const { connectMongo } = require('./db/mongodb');
const generateReport = require('./jobs/generateReports');
const logger = require('./logger');

const INTERVAL_MINUTES = parseInt(process.env.REPORT_INTERVAL_MINUTES ?? '5');

const start = async () => {
  logger.info('Worker2 starting up');

  // Connect to MongoDB first
  await connectMongo();

  // Run once immediately on startup so there's always a report available
  logger.info('Running initial report generation on startup');
  await generateReport();

  // Then run on a schedule — default every 5 minutes
  const cronExpression = `*/${INTERVAL_MINUTES} * * * *`;
  logger.info(`Scheduling report generation every ${INTERVAL_MINUTES} minutes`);

  cron.schedule(cronExpression, async () => {
    logger.info('Cron triggered — generating report');
    await generateReport();
  });

  logger.info('Worker2 running');
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('Worker2 shutting down gracefully');
  process.exit(0);
});

start().catch((err) => {
  logger.error('Worker2 failed to start', { error: err.message });
  process.exit(1);
});
