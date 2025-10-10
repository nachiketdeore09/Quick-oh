import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
        unique: true
    },
    description: {
        type: String,
        lowercase: true,
        trim: true,
    },
    productCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    price: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        default: 0
    },
    stock: {
        type: String,
        enum: ["Available", "Out Of Stock", "Very Few Remaining"],
        required: true,
    },
    // TODO:- add function to upload array of product images
    productImage: {
        type: String,
        required: true
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    searches: {
        type: Number,
        default: 0,
    }
}, { timestamps: true })

export const Product = mongoose.model("Product", productSchema)