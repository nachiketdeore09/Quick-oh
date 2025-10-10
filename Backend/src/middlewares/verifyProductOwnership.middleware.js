import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { Product } from "../models/product.models.js";

export const verifyProductOwnership = asyncHandler(async (req, res, next) => {
    const productId = req.params.id || req.body.productId; // Get product ID from request parameters
    console.log(productId);
    // Find the product by ID
    const product = await Product.findById(productId);

    if (!product) {
        throw new apiError(404, "Product not found");
    }

    // Check if the vendor is the owner of the product
    if (product.vendor.toString() !== req.user.id) {
        throw new apiError(403, "You are not authorized to access this product");
    }

    // Attach the product to the request object for further use
    req.product = product;

    next(); // Proceed to the next middleware or controller
})