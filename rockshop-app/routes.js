const { Pool } = require("pg");
const path = require("path");
const pool = new Pool({
  user: "postgres",
  host: "db",
  database: "rockshop_inventory_db",
  password: "postgrespw",
  port: 5432,
});

exports.getMinerals = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM minerals ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching minerals:", err);
    res.status(500).send("Error fetching data");
  }
};

exports.deleteMineral = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM minerals WHERE id = $1", [id]);
    res.send("Deleted");
  } catch (err) {
    console.error("Error deleting mineral:", err);
    res.status(500).send("Error deleting mineral");
  }
};

exports.updateMineral = async (req, res) => {
  const { id } = req.params;
  const { name, price, amount, weight } = req.body;
  try {
    await pool.query(
      "UPDATE minerals SET name=$1, price=$2, amount=$3, weight=$4 WHERE id=$5",
      [name, price, amount, weight, id]
    );
    res.send("Mineral updated");
  } catch (err) {
    console.error("Error updating mineral:", err);
    res.status(500).send("Error updating mineral");
  }
};


exports.addMineral = async (req, res) => {
  const { name, price, amount, weight } = req.body;
  const photo = req.file ? req.file.filename : null;

  try {
    // 1) Insert and return new ID
    const insert = await pool.query(
      `INSERT INTO minerals(name, price, amount, weight, photo)
       VALUES($1,$2,$3,$4,$5) RETURNING id`,
      [name, price, amount, weight, photo]
    );
    const newId = insert.rows[0].id;

    // 2) Kick off embedding call if there's a photo
    if (photo) {
      // Node 18+ has global fetch—no need for node-fetch
      const resp = await fetch("http://localhost:5000/add-embedding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: newId, image_path: `/uploads/${photo}` }),
      });
      if (!resp.ok) {
        console.error("Embed service error:", await resp.text());
      }
    }

    res.status(201).json({ id: newId });
  } catch (err) {
    console.error("Error adding mineral:", err);
    res.status(500).send("Error adding mineral");
  }
};
