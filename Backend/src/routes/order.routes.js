import { Router } from "express";
import {
    createOrder, getUserOrderHistory, getSingleOrderById, updateOrderStatus,
    cancelOrder, acceptListedOrder, getActiveOrders, getLiveOrderStatus, fetchLivePartnerLocation
} from "../controllers/order.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkAdmin } from "../middlewares/checkAdmin.middleware.js";
import { rateLimiter } from "../utils/rateLimiter.redis.js";
const router = Router();

router.route("/createOrder").post(
    verifyJWT,
    rateLimiter({
        keyPrefix: "order",
        limit: 3,
        windowSeconds: 300,
        identifier: "user"
    }),
    createOrder
)

router.route("/getUserOrderHistory").get(
    verifyJWT,
    getUserOrderHistory
)

router.route("/getSingleOrderById/:id").get(
    verifyJWT,
    getSingleOrderById
)

router.route("/updateOrderStatus/:id").post(
    verifyJWT,
    checkAdmin,
    updateOrderStatus
)

router.route("/cancelOrder/:id").put(
    verifyJWT,
    cancelOrder
)

router.route("/acceptListedOrder/:id").put(
    verifyJWT,
    acceptListedOrder
)

router.route("/getActiveOrders").get(
    verifyJWT,
    getActiveOrders
)

router.route("/getLiveOrderStatus/:id").get(
    verifyJWT,
    getLiveOrderStatus
)

router.route("/livePartnerLocation/:id").get(
    verifyJWT,
    fetchLivePartnerLocation
)


export default router;