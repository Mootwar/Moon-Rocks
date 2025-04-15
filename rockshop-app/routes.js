const express = require('express');
const router = express.Router();
const pool = require('./db');

/**
 * GET /minerals
 * Returns a list of minerals from the DB
 */
router.get('/minerals', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM minerals ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving minerals');
  }
});

/**
 * POST /minerals
 * Insert a new mineral
 */
router.post('/minerals', async (req, res) => {
    console.log('Incoming body:', req.body);
  try {
    const { name, mineral_type, cost, weight, location, description, quantity_in_stock } = req.body;
    const query = `
      INSERT INTO minerals (name, mineral_type, cost, weight, location, description, quantity_in_stock)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [name, mineral_type, cost, weight, location, description, quantity_in_stock];
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error inserting mineral');
  }
});

/**
 * PUT /minerals/:id
 * Update an existing mineral
 */
router.put('/minerals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, mineral_type, cost, weight, location, description, quantity_in_stock } = req.body;
    const query = `
      UPDATE minerals
      SET name=$1, mineral_type=$2, cost=$3, weight=$4, location=$5, description=$6, quantity_in_stock=$7, last_updated=NOW()
      WHERE id=$8
      RETURNING *;
    `;
    const values = [name, mineral_type, cost, weight, location, description, quantity_in_stock, id];
    const result = await pool.query(query, values);
    if (result.rowCount === 0) {
      return res.status(404).send('Mineral not found');
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating mineral');
  }
});

/**
 * DELETE /minerals/:id
 * Delete a mineral
 */
router.delete('/minerals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM minerals WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).send('Mineral not found');
    }
    res.sendStatus(204); // No Content
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting mineral');
  }
});

module.exports = router;
