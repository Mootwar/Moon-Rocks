const express = require("express");
const multer = require("multer");
const path = require("path");
const routes = require("./routes");

const app = express();
const PORT = process.env.PORT || 3000;

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "public", "uploads");
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/minerals", routes.getMinerals);

// Note the upload.single("photo") middleware here:
app.post("/minerals", upload.single("photo"), routes.addMineral);

app.put("/minerals/:id", upload.none(), routes.updateMineral);
app.delete("/minerals/:id", routes.deleteMineral);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
