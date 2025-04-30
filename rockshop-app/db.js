const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'db', // ⚠️ This must match the service name in docker-compose.yml
  database: 'rockshop_inventory_db',
  password: 'postgrespw',
  port: 5432
});

module.exports = pool;