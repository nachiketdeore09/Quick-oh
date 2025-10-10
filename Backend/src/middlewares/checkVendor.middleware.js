import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";

export const checkVendor = asyncHandler(async (req, res, next) => {
    try {
        if (req.user && req.user.role === "vendor") {
            next();
        } else {
            return res
                .status(403)
                .json(
                    new apiResponse(
                        403,
                        req.user,
                        "Access denied! Only vendor can perform this operation"
                    )
                )
        }
    } catch (error) {
        throw new apiError(404, "error while verifying vendor")
    }
})