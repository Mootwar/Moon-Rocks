require('dotenv').config();          // harmless inside container
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 5432,
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || 'postgrespw',
  database: process.env.DB_NAME     || 'rockshop_inventory_db'
});

module.exports = pool;