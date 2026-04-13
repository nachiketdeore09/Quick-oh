import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyProductOwnership } from "../middlewares/verifyProductOwnership.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkVendor } from "../middlewares/checkVendor.middleware.js";
import {
    createProduct, updateProduct, updateProductPicture, toggleStock, getAllProducts,
    getSingleProduct, searchProduct, deleteProduct
} from "../controllers/product.controllers.js";
import { rateLimiter } from "../utils/rateLimiter.redis.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createProductSchema, updateProductSchema } from "../schemas/product.schema.js";

const router = Router();

//secured routes

router.route("/createProduct").post(
    verifyJWT,
    checkVendor,
    upload.single("productImage"),
    validate(createProductSchema),
    createProduct
)

router.route("/updateProduct/:id").put(
    verifyJWT,
    checkVendor,
    verifyProductOwnership,
    validate(updateProductSchema),
    updateProduct,
)

router.route("/updateProductImage/:id").put(
    verifyJWT,
    checkVendor,
    verifyProductOwnership,
    upload.single("productImage"),
    updateProductPicture
)

router.route("/toggleStock/:id").put(
    verifyJWT,
    checkVendor,
    verifyProductOwnership,
    toggleStock
)

router.route("/deleteProduct/:id").delete(
    verifyJWT,
    checkVendor,
    verifyProductOwnership,
    deleteProduct
)

//for any customer

router.route("/getAllProducts").get(
    getAllProducts,
)

router.route("/getSingleProduct/:id").get(
    verifyJWT,
    getSingleProduct
)

router.route("/searchProducts").get(
    verifyJWT,
    rateLimiter({
        keyPrefix: "search",
        limit: 20,
        windowSeconds: 60
    }),
    searchProduct
)
export default router;
