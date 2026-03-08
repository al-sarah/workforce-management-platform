const { Pool } = require('pg');

// Connection pool — reuses connections instead of opening a new one each query
const pool = new Pool({
  connectionString: process.env.POSTGRES_URI,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL error', err);
});

module.exports = pool;
