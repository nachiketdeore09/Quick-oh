import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../cloudinary.js";
import { Product } from "../models/product.models.js";
import mongoose from "mongoose";

const createProduct = asyncHandler(async (req, res) => {
    //take product details
    //validate the details
    // check if product already exist
    // check for images 
    // upload images
    // create a entry in db
    // return product

    const { productName, description, productCategory, price, discount, stock } = req.body;

    if ([productName, description, productCategory, price, stock].some((feild) =>
        feild?.trim() === ""
    )) {
        throw new apiError(400, "All feilds are required");
    }
    const vendor = req.user._id;
    const productExist = await Product.findOne({
        $and: [{ productName }, { vendor }]
    })

    if (productExist) {
        throw new apiError(400, "Product already exists for this vendor");
    }

    const productImagePath = req.file?.path;

    if (!productImagePath) {
        throw new apiError(401, "please upload product image");
    }

    const productImage = await uploadOnCloudinary(productImagePath);

    if (!productImage) {
        throw new apiError(400, "error while uploading");
    }

    const productEntry = await Product.create(
        {
            productName,
            description,
            productCategory,
            price,
            discount: parseInt(discount, 10) || 0, // Default discount to 0 if not provided
            stock,
            vendor: req.user._id,
            productImage: productImage.url,
        }
    )

    if (!productEntry) {
        throw new apiError(401, "Error while creating product");
    }

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                productEntry,
                "Product created successfully"
            )
        )

})

const updateProduct = asyncHandler(async (req, res) => {
    const productId = req.params.id; // Get product ID from request parameters
    console.log("product id: ", productId);
    const { productName, description, productCategory, price, discount } = req.body; // Get updated fields from request body
    console.log(req.body);

    // Validate required fields
    if ([productName, description, productCategory, price].some((field) => String(field).trim() === "")) {
        throw new apiError(400, "All fields except discount are required");
    }

    //check if the productCategrory is a valid object
    // here user will first fetch all types of product category then will select one from it
    // if (!mongoose.Types.ObjectId.isValid(productCategory)) {
    //     throw new apiError(404, "Invalid product category");
    // }

    // Find the product by ID and update it 
    const product = await Product.findByIdAndUpdate(
        productId,
        {
            $set: {
                productName: productName.trim(),
                description: description.trim(),
                // productCategory: productCategory,
                price: price,
                discount: parseInt(discount, 10) || 0,
            }
        },
        {
            new: true
        }
    ).select("-vendor");

    if (!product) {
        throw new apiError(404, "No such product found");
    }

    // Return the updated product
    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                product,
                "Product updated successfully"
            )
        );
})

const updateProductPicture = asyncHandler(async (req, res) => {
    const productId = req.params?.id;
    const newProductPicturePath = req.file?.path;

    if (!productId) {
        throw new apiError(401, "Select a product");
    }

    if (!newProductPicturePath) {
        throw new apiError(401, "Image path is required");
    }

    const product = await Product.findById(productId);

    if (!product) {
        throw new apiError(401, "No such Product found");
    }

    const newProductPicture = await uploadOnCloudinary(newProductPicturePath);

    if (!newProductPicture) {
        throw new apiError(400, "Error while uploading");
    }

    product.productImage = newProductPicture?.url || product.productImage;

    await product.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                product,
                "successfully updated the product picture"
            )
        )


})

const toggleStock = asyncHandler(async (req, res) => {
    const productId = req.params?.id;

    const product = await Product.findById(productId);

    if (!product) {
        throw new apiError(404, "No such Product found");
    }

    const { stockStatus } = req.body;

    if (stockStatus !== "Available" && stockStatus !== "Out Of Stock" && stockStatus !== "Very Few Remaining") {
        throw new apiError(401, "Invalid input Stock");
    }

    product.stock = stockStatus;
    await product.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                product,
                "Stock Successfully updated"
            )
        )
})

const getAllProducts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query; // Get page and limit from query parameters, default to page 1 and limit 10

    // Convert page and limit to integers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber <= 0 || limitNumber <= 0) {
        throw new apiError(400, "Invalid page or limit value");
    }

    // Calculate the number of documents to skip
    const skip = (pageNumber - 1) * limitNumber;

    // Fetch products with pagination
    const products = await Product.aggregate([
        {
            $lookup: {
                from: "categories", // 🔁 the collection name of categories (usually lowercase plural of model name)
                localField: "productCategory",
                foreignField: "_id",
                as: "categoryDetails"
            }
        },
        {
            $unwind: "$categoryDetails"
        },
        {
            $project: {
                _id: 1,
                productName: 1,
                description: 1,
                price: 1,
                discount: 1,
                stock: 1,
                productImage: 1,
                createdAt: 1,
                updatedAt: 1,
                productCategory: "$categoryDetails.name" // Replace ObjectId with actual category name
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $skip: skip
        },
        {
            $limit: limitNumber
        }
    ]);

    // Get the total count of products
    const totalProducts = await Product.countDocuments();

    // Calculate total pages
    const totalPages = Math.ceil(totalProducts / limitNumber);

    // Return the paginated response
    return res.status(200).json(
        new apiResponse(
            200,
            {
                products,
                currentPage: pageNumber,
                totalPages,
                totalProducts,
            },
            "Products fetched successfully"
        )
    );
})

const getSingleProduct = asyncHandler(async (req, res) => {
    const productId = req.params.id;
    if (!productId) {
        throw new apiError(401, "receieved no product Id");
    }
    const product = await Product.findById(productId).select("-__v");
    if (!product) {
        throw new apiError(404, "No such Product exist");
    }
    product.searches += 1;
    await product.save({ validateBeforeSave: false });
    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                product,
                "product successfully fetched"
            )
        )
})

// TODO: In this search product controller impliment the Semantic Search 
// here we're using regex-> This is a pattern searching in JS which will match the given input string in the passed feild 
const searchProduct = asyncHandler(async (req, res) => {
    const { keyword, page = 1, limit = 10 } = req.query;

    if (!keyword || keyword.trim() === "") {
        throw new apiError(401, "Nothing passed for search");
    }
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber <= 0 || limitNumber <= 0) {
        throw new apiError(400, "Invalid page or limit value");
    }

    const skip = (pageNumber - 1) * limitNumber;

    const products = await Product.aggregate([
        {
            $match: {
                $or: [
                    { productName: { $regex: keyword, $options: "i" } },
                    { description: { $regex: keyword, $options: "i" } },
                    { productCategory: { $regex: keyword, $options: "i" } }
                ]
            }
        },
        {
            $sort: { createdAt: -1 } // optional: newest first
        },
        {
            $project: {
                productName: 1,
                description: 1,
                price: 1,
                discount: 1,
                createdAt: 1,
                stock: 1,
                productImage: 1,
            }
        },
        { $skip: skip },
        { $limit: limitNumber }
    ])

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                products,
                "search done successfully "
            )
        )
})

export {
    createProduct,
    updateProduct,
    updateProductPicture,
    toggleStock,
    getAllProducts,
    getSingleProduct,
    searchProduct
}