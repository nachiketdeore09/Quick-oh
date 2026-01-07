import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateRefreshAndAccessTokens } from "../controllers/user.controllers.js"; // import helper

export const verifyJWT = asyncHandler(async (req, res, next) => {
    // console.log("AccessToken Cookie:", req.cookies?.accessToken);
    // console.log("RefreshToken Cookie:", req.cookies?.refreshToken);
    // console.log("Authorization Header:", req.header("Authorization"));

    try {
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            console.log("No token found -> Unauthorized");
            throw new apiError(401, "Unauthorized access");
        }

        try {
            // ✅ Verify access token normally
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            const user = await User.findById(decoded._id).select(
                "-password -refreshToken"
            );

            if (!user) throw new apiError(401, "Invalid access token");

            req.user = user;
            return next();
        } catch (error) {
            // ✅ If token expired, try refreshing it
            if (error.name === "TokenExpiredError") {
                const refreshToken = req.cookies?.refreshToken;
                if (!refreshToken) throw new apiError(401, "Session expired. Please log in again.");

                const decodedRefresh = jwt.verify(
                    refreshToken,
                    process.env.REFRESH_TOKEN_SECRET
                );

                const user = await User.findById(decodedRefresh._id);
                if (!user || user.refreshToken !== refreshToken)
                    throw new apiError(401, "Invalid refresh token. Please log in again.");

                // ✅ Generate new tokens
                const { accessToken } = await generateRefreshAndAccessTokens(user._id);

                // ✅ Set new cookie for access token
                res.cookie("accessToken", accessToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                });

                req.user = user;
                return next();
            } else {
                throw new apiError(401, "Invalid access token");
            }
        }
    } catch (error) {
        throw new apiError(401, error?.message || "Unauthorized access");
    }
});
