import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
    registerUser, loginUser, logoutUser, refreshAccessTokens, changeCurrentUserPassword, getCurrentUser,
    updateAccountDetails, updateUserProfilePicture
} from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(
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

//TODO :- write the further routes for the remaining controllers in user.controller.js

export default router;