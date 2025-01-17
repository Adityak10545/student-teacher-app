const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");

// POST: Mark attendance
router.post("/mark", async (req, res) => {
    const { studentId, date, status } = req.body;

    if (!studentId || !date || !status) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        const attendance = new Attendance({ studentId, date, status });
        await attendance.save();
        res.status(201).json({ message: "Attendance marked successfully." });
    } catch (err) {
        res.status(500).json({
            message: "Error marking attendance.",
            error: err,
        });
    }
});

// GET: Get attendance records
router.get("/", async (req, res) => {
    try {
        const attendanceRecords = await Attendance.find();
        res.status(200).json({ attendance: attendanceRecords });
    } catch (err) {
        res.status(500).json({
            message: "Error fetching attendance records.",
            error: err,
        });
    }
});

module.exports = router;
