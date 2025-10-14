import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";

export const checkAdmin = asyncHandler(async (req, res, next) => {
    try {

        if (req.user && req.user.role === "admin") {
            console.log(req.body);
            next();
        } else {
            return res
                .status(403)
                .json(
                    new apiResponse(
                        403,
                        req.user,
                        "Access denied! Only admin can perform this operation"
                    )
                )
        }
    } catch (error) {
        throw new apiError(404, "error while verifying admin")
    }
})