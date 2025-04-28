const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Assume you have a database connection object called 'db'
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/yourdbname'
});

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Load all minerals
router.get('/minerals', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});

// Get one mineral including its images
router.get('/minerals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const mineral = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    const images = await pool.query('SELECT image_path FROM images WHERE product_id = $1', [id]);

    if (mineral.rows.length === 0) {
      return res.status(404).send('Mineral not found');
    }

    res.json({
      ...mineral.rows[0],
      images: images.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});

// Upload image for a mineral
router.post('/minerals/:id/images', upload.single('photo'), async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).send('No file uploaded');
    }

    const imagePath = path.join('uploads', file.filename);

    // Dummy vector, 1280-dimensions of zeros
    const dummyEmbedding = Array(1280).fill(0);

    await pool.query(
      'INSERT INTO images (product_id, image_path, embedding) VALUES ($1, $2, $3)',
      [id, imagePath, dummyEmbedding]
    );

    res.status(201).send('Image uploaded');
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});

// Add a new mineral
router.post('/minerals', upload.single('photo'), async (req, res) => {
  try {
    const { name, price, amount } = req.body;
    const file = req.file;

    if (!name || !price || !amount) {
      return res.status(400).send('Missing required fields');
    }

    const result = await pool.query(
      'INSERT INTO products (name, price, amount) VALUES ($1, $2, $3) RETURNING id',
      [name, price, amount]
    );

    const newMineralId = result.rows[0].id;

    if (file) {
      const imagePath = path.join('uploads', file.filename);
      const dummyEmbedding = Array(1280).fill(0);

      await pool.query(
        'INSERT INTO images (product_id, image_path, embedding) VALUES ($1, $2, $3)',
        [newMineralId, imagePath, dummyEmbedding]
      );
    }

    res.status(201).send('Mineral added');
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});

module.exports = router;
