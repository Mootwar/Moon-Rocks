const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("./routes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving
app.use(express.static(path.join(__dirname, "public")));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "public", "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Mineral routes
app.get("/minerals", db.getMinerals);
app.post("/minerals", upload.single("photo"), db.addMineral);
app.delete("/minerals/:id", db.deleteMineral);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});