import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
    registerUser, loginUser, logoutUser, refreshAccessTokens, changeCurrentUserPassword, getCurrentUser,
    updateAccountDetails, updateUserProfilePicture, getUserById
} from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { rateLimiter } from "../utils/rateLimiter.redis.js";
const router = Router();

router.route("/register").post(
    rateLimiter({
        keyPrefix: "login",
        limit: 5,
        windowSeconds: 60
    }),
    upload.single("profilePicture"),
    registerUser
)

router.route("/login").post(loginUser)

//secure routes

router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refresh-token").post(verifyJWT, refreshAccessTokens);

router.route("/change-password").post(verifyJWT, changeCurrentUserPassword)

router.route("/current-user").get(verifyJWT, getCurrentUser);

router.route("/update-account").patch(verifyJWT, updateAccountDetails);

router.route("/profilePicture").patch(verifyJWT, upload.single("profilePicture"), updateUserProfilePicture);

router.route("/getUserById").get(verifyJWT, getUserById);

//TODO :- write the further routes for the remaining controllers in user.controller.js

export default router;