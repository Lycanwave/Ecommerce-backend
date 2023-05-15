const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        product: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        description: {
            type: String,
            require: true,
        },
        price: {
            type: Number,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
        },
        images: {
            type: Array,
        },
        color: {
            type: String,
            required: true,
        },
        ratings: {
            star: Number,
            postedby: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        },
        brand: {
            type: String,
            required: true,
        },
        sold: {
            type: Number,
            default: 0,
            select: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
