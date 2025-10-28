import express from "express";
import multer from "multer";
import fs from "fs-extra";
import path from "path";
import cors from "cors";

const app = express();
const PORT = 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.static("public"));

// --- Multer setup (for file uploads) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname),
});
const upload = multer({ storage });

// --- Serve content.json ---
app.get("/api/content", async (req, res) => {
  const filePath = "public/content.json";
  const data = await fs.readJson(filePath);
  res.json(data);
});

// --- Update content.json ---
app.post("/api/save", async (req, res) => {
  try {
    const { content } = req.body;
    await fs.writeJson("public/content.json", content, { spaces: 2 });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Upload endpoint ---
app.post("/api/upload", upload.single("file"), (req, res) => {
  res.json({ url: "/uploads/" + req.file.filename });
});

// --- Start server ---
app.listen(PORT, () => console.log(`✅ CMS running at http://localhost:${PORT}`));
