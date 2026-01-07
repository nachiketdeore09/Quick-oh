import { Router } from "express";
import {
    addProductToCart, decreaseCartItemQuantity, getCartInfo, removeAnItemFromCart, clearCart
} from "../controllers/cart.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkAdmin } from "../middlewares/checkAdmin.middleware.js";
import { rateLimiter } from "../utils/rateLimiter.redis.js";

const router = Router();

router.route("/addProductToCart").post(
    verifyJWT,
    rateLimiter({
        keyPrefix: "addToCart",
        limit: 30,
        windowSeconds: 60,
        identifier: "user"
    }),
    addProductToCart
)

router.route("/reduceOneItem").post(
    verifyJWT,
    decreaseCartItemQuantity
)

router.route("/getCartInfo").get(
    verifyJWT,
    getCartInfo
)

router.route("/removeAnItemFromCart").post(
    verifyJWT,
    removeAnItemFromCart
)

router.route("/clearCart").delete(
    verifyJWT,
    clearCart
)

export default router;