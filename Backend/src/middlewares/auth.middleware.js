import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        // accepting token from the cookies or header
        const token = await req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            throw new apiError(400, "Unauthorised access");
        }

        // decoding the token to retrieve the users id
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken._id).select(
            "-password -refreshToken"
        )

        if (!user) {
            throw new apiError(400, "invalid access token");
        }

        // adding a additional user object to the req so that it can be used in further secured controllers
        req.user = user;
        // console.log(user);
        // console.log(req.body)
        next();

    } catch (error) {
        throw new apiError(400, error?.message || "Invalid access token");
    }
})