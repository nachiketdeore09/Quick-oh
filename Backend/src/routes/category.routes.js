import { Router } from "express";
import {
    createCategory,
    getAllCategories,
    deleteCategory
} from "../controllers/category.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkAdmin } from "../middlewares/checkAdmin.middleware.js";

const router = Router();

router.route("/createCategory").post(
    verifyJWT,
    checkAdmin,
    createCategory
);      // Admin use
router.route("/getAllCategories").get(
    verifyJWT,
    getAllCategories
);     // Public use
router.route("/deleteCategory").delete(
    verifyJWT,
    checkAdmin,
    deleteCategory
); // Admin use

export default router;