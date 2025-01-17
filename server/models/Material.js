// models/Material.js
const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        url: { type: String, required: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Material", materialSchema);
