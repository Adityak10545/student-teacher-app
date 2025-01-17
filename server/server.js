const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const session = require("express-session");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

// Import routes
const authRoutes = require("./routes/auth");
const materialRoutes = require("./routes/materials");
const attendanceRoutes = require("./routes/attendance");

// Load environment variables
dotenv.config();

// Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Set up multer storage for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, "uploads");
        // Ensure the 'uploads' directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir); // Set the upload destination to 'uploads' folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Use timestamp to avoid filename collision
    },
});

// Multer middleware for single file upload
const upload = multer({ storage });

// Serve static files (e.g., uploaded materials)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Configure session middleware
app.use(
    session({
        secret: process.env.SESSION_SECRET || "your-secret-key", // Use a secure key
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: process.env.NODE_ENV === "production", // Set to true in production
            httpOnly: true, // Helps prevent XSS attacks
        },
    })
);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/attendance", attendanceRoutes);

// MongoDB connection
mongoose
    .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/student", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("✅ MongoDB connected successfully"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));

// File upload route (for material upload)
app.post("/api/materials/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).send({ error: "No file uploaded" });
    }

    const { title } = req.body; // Assuming the title is sent in the body
    const fileUrl = `/uploads/${req.file.filename}`; // URL to access the file

    // Save file data (title and URL) in your database (MongoDB or any other DB)
    const Material = require("./models/Material"); // Assuming you have a Material model
    const newMaterial = new Material({
        title,
        url: fileUrl,
    });

    newMaterial
        .save()
        .then(() =>
            res.status(200).send({ message: "File uploaded successfully!" })
        )
        .catch((err) =>
            res.status(500).send({ error: "Failed to save material" })
        );
});

// API to get all uploaded materials
app.get("/api/materials", (req, res) => {
    const Material = require("./models/Material");
    Material.find()
        .then((materials) => res.json({ materials }))
        .catch((err) =>
            res.status(500).send({ error: "Failed to fetch materials" })
        );
});

// Start the server
app.listen(PORT, () =>
    console.log(`🚀 Server running on http://localhost:${PORT}`)
);
