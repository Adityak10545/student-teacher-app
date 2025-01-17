// routes/materials.js
const express = require("express");
const multer = require("multer");
const Material = require("../models/Material");
const router = express.Router();

// Set up multer storage
const upload = multer({ dest: "uploads/" });

// GET /api/materials - Fetch all materials
router.get("/", async (req, res) => {
    try {
        const materials = await Material.find(); // Fetch all materials from DB
        res.json({ materials });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch materials." });
    }
});

router.post("/upload", upload.single("file"), async (req, res) => {
    const { title } = req.body;
    const file = req.file;

    if (!title || !file) {
        return res.status(400).json({ error: "Title and file are required." });
    }

    try {
        const material = new Material({
            title,
            url: `/uploads/${file.filename}`, // Save the file path in DB
        });

        await material.save(); // Save material to DB
        res.json({ message: "Material uploaded successfully." });
    } catch (err) {
        res.status(500).json({ error: "Failed to upload material." });
    }
});

module.exports = router;
