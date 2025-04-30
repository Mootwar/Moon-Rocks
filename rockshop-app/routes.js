const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const db = require('./db'); // adjust path if your db.js is in a subfolder
const { Pool } = require("pg");
const pool = new Pool({
  host: "db",       // Docker Compose service name
  user: "postgres",
  password: "postgrespw",
  database: "rockshop_inventory_db",
  port: 5432
});

// Set up multer storage
const storage = multer.diskStorage({
  destination: path.join(__dirname, 'public/uploads'), // full path to the public/uploads directory
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

// Optional: restrict to images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // optional: 5MB max
});


// GET all minerals
router.get("/minerals", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM minerals ORDER BY id ASC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch minerals" });
  }
});

// POST a new mineral
router.post("/minerals", upload.single("photo"), async (req, res) => {
  try {
    const { name, price, amount, weight } = req.body;
    const photo = req.file ? req.file.filename : null;

    const insertQuery = `
      INSERT INTO minerals (name, price, amount, weight, photo)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [name, price, amount, weight, photo];

    const { rows } = await pool.query(insertQuery, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add mineral" });
  }
});

router.patch('/api/minerals/:id', async (req, res) => {
  const { price, amount } = req.body;
  const { id } = req.params;

  try {
    const result = await db.query(
      'UPDATE minerals SET price = $1, amount = $2 WHERE id = $3 RETURNING *',
      [price, amount, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating mineral:', err);
    res.status(500).send('Server error');
  }
});

router.delete('/api/minerals/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await db.query('DELETE FROM minerals WHERE id = $1', [id]);
    res.status(204).send(); // No content
  } catch (err) {
    console.error('Error deleting mineral:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;