const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { Pool } = require("pg");
const pool = new Pool({
  host: "db",       // Docker Compose service name
  user: "postgres",
  password: "postgrespw",
  database: "rockshop_inventory_db",
  port: 5432
});

// Set up file upload handling
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // timestamp + extension
  }
});
const upload = multer({ storage });

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
    const { name, price, amount } = req.body;
    const photo = req.file ? req.file.filename : null;

    const insertQuery = `
      INSERT INTO minerals (name, price, amount, photo)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [name, price, amount, photo];

    const { rows } = await pool.query(insertQuery, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add mineral" });
  }
});

module.exports = router;