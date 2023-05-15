const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
    },
    { timestamp: true }
);

module.exports = mongoose.model("Category", categorySchema);
