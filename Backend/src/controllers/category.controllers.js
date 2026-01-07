import { asyncHandler } from "../utils/asyncHandler.js";
import { Category } from "../models/category.models.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { uploadOnCloudinary } from "../cloudinary.js";
import redis from "../db/redis.js";

const createCategory = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    console.log(name)
    console.log(description)
    if (name?.trim() === "") {
        throw new apiError(400, "Category name is required");
    }

    const exists = await Category.findOne({ name: name.trim() });
    if (exists) {
        throw new apiError(409, "Category already exists");
    }

    const categoryImagePath = req.file?.path;

    if (!categoryImagePath) {
        throw new apiError(401, "please upload product image");
    }

    const categoryImage = await uploadOnCloudinary(categoryImagePath);
    if (!categoryImage) {
        throw new apiError(400, "error while uploading");
    }

    const category = await Category.create({
        name: name.trim(),
        description: description?.trim() || "",
        categoryImage: categoryImage.url,
    });

    // Clear the Redis Cache
    await redis.del("categories:all");
    await redis.keys("products:*").then(keys => keys.length && redis.del(keys));

    return res
        .status(201)
        .json(
            new apiResponse(
                201,
                category,
                "Category created"
            ));
});

const getAllCategories = asyncHandler(async (req, res) => {

    // define redis key
    const CACHE_KEY = "categories:all";

    //Check for Redis
    const cached = await redis.get(CACHE_KEY);
    if (cached) {
        return res.status(200).json(
            new apiResponse(200, JSON.parse(cached), "Categories fetched from cache")
        );
    }

    const categories = await Category.find().select("-__v");


    await redis.set(
        "categories:all",
        JSON.stringify(categories),
        "EX",
        600
    );

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                categories,
                "All categories fetched"
            ));
});

const deleteCategory = asyncHandler(async (req, res) => {
    const categoryId = req.params;

    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) {
        throw new apiError(404, "Category not found");
    }

    // Clear redis Cache
    await redis.del("categories:all");
    await redis.keys("products:*").then(keys => keys.length && redis.del(keys));

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                null,
                "Category deleted successfully"
            ));
});

export {
    createCategory,
    getAllCategories,
    deleteCategory
};