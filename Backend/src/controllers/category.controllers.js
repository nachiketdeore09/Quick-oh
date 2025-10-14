import { asyncHandler } from "../utils/asyncHandler.js";
import { Category } from "../models/category.models.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { uploadOnCloudinary } from "../cloudinary.js";

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
    const categories = await Category.find().select("-__v");
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