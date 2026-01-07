import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { Order } from "../models/order.models.js";
import { Cart } from "../models/cart.models.js";
import { User } from "../models/user.models.js";
import { getIO } from "../utils/socket.io.js";
import { Product } from "../models/product.models.js";
import redis from "../db/redis.js";
import { setOrderStatus, getOrderStatus, clearOrderStatus } from "../utils/orderStatus.redis.js";
import { getDeliveryLocation } from "../utils/deliveryLocation.redis.js";

const createOrder = asyncHandler(async (req, res) => {
    const userId = req.user._id.toString();
    const { address, latitude, longitude } = req.body;

    if (!address.trim()
        && !latitude && !longitude) {
        throw new apiError(400, "Shipping address is required");
    }

    // 1️⃣ Fetch cart from Redis
    const cartKey = `cart:${userId}`;
    const cartItems = await redis.hgetall(cartKey);
    if (!cartItems || Object.keys(cartItems).length === 0) {
        throw new apiError(400, "Your cart is empty");
    }
    const productIds = Object.keys(cartItems);

    // Fetch Products details from mongo DB
    const products = await Product.find({ _id: { $in: productIds } })
        .select("price discount")
        .lean();

    if (products.length === 0) {
        throw new apiError(400, "Cart contains invalid products");
    }
    // calculate total + orderItems
    let totalAmount = 0;

    const orderItems = products.map(product => {
        const quantity = parseInt(cartItems[product._id]);
        const discount = product.discount || 0;
        const priceAfterDiscount =
            product.price - (product.price * discount / 100);

        totalAmount += priceAfterDiscount * quantity;

        return {
            product: product._id,
            quantity
        };
    });
    //Create an order in MONGO db
    const newOrder = await Order.create({
        user: userId,
        items: orderItems,
        totalAmount,
        shippingAddress: {
            address,
            latitude,
            longitude
        },
        paymentStatus: "Pending",
        status: "Pending"
    });

    await setOrderStatus(newOrder._id, "Pending");

    //Clear the redis Cart
    await redis.del(cartKey);


    // const cart = await Cart.findOne({ user: userId }).populate("items.product");

    // if (!cart || cart.items.length === 0) {
    //     throw new apiError(400, "Your cart is empty");
    // }

    // let totalAmount = 0;
    // const orderItems = cart.items.map(item => {
    //     const productPrice = item.product.price;
    //     const discount = item.product.discount || 0;
    //     const priceAfterDiscount = productPrice - (productPrice * discount / 100);
    //     totalAmount += priceAfterDiscount * item.quantity;

    //     return {
    //         product: item.product._id,
    //         quantity: item.quantity
    //     };
    // });
    // console.log("Creating order with:");
    // console.log("Address:", address);
    // console.log("Latitude:", latitude);
    // console.log("Longitude:", longitude);

    // const newOrder = await Order.create({
    //     user: userId,
    //     items: orderItems,
    //     totalAmount,
    //     shippingAddress: {
    //         latitude: latitude,
    //         longitude: longitude,
    //         address: address
    //     },
    //     paymentStatus: "Pending", // Assume payment not completed yet
    //     status: "Pending"
    // });

    // // Clear cart after placing order
    // cart.items = [];
    // await cart.save();

    // get the io:
    const io = getIO();

    const deliveryPartners = await User.find(
        {
            role: "deliveryPartner",
            isAvailable: true
        });

    deliveryPartners.forEach(partner => {
        io.to(`delivery-partner-${partner._id}`).emit("newOrder", {
            message: "New order available for delivery",
            orderId: newOrder._id,
            shippingAddress: newOrder.shippingAddress,
            totalAmount: newOrder.totalAmount
        });
    });
    console.log(newOrder._id);

    return res
        .status(201)
        .json(
            new apiResponse(
                201,
                newOrder,
                "Order created successfully"
            )
        );
});

//Get All Orders
//Get User's Orders

const getUserOrderHistory = asyncHandler(async (req, res) => {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const orders = await Order.aggregate([
        {
            $match: { user: userId }
        },
        {
            $lookup: {
                from: "products", // your collection name in MongoDB (plural, lowercase)
                localField: "items.product",
                foreignField: "_id",
                as: "productDetails"
            }
        },
        {
            $unwind: "$items"
        },
        {
            $lookup: {
                from: "products",
                localField: "items.product",
                foreignField: "_id",
                as: "items.product"
            }
        },
        {
            $unwind: "$items.product"
        },
        {
            $group: {
                _id: "$_id",
                user: { $first: "$user" },
                status: { $first: "$status" },
                totalAmount: { $first: "$totalAmount" },
                createdAt: { $first: "$createdAt" },
                items: { $push: "$items" }
            }
        },
        {
            $sort: { createdAt: -1 }
        }
    ]);

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                orders,
                "Order history fetched with aggregation"
            )
        );
});

//Get Single Order by ID
const getSingleOrderById = asyncHandler(async (req, res) => {
    const orderId = req.params.id;
    console.log(orderId)

    // Validate if orderId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        throw new apiError(400, "Invalid order ID");
    }

    const order = await Order.findById(orderId)
        .populate("items.product", "productName price discount description productImage") // adjust fields as needed
        .populate("user", "name email"); // optional: if you want user info in admin panel

    if (!order) {
        throw new apiError(404, "Order not found");
    }

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                order,
                "Order fetched successfully"
            ));
});
//Update Order Status
const updateOrderStatus = asyncHandler(async (req, res) => {
    const orderId = req.params.id;
    const { status } = req.body;

    const validStatuses = ["Pending", "Accepted", "Shipped", "Delivered", "Cancelled"];

    // Validate input
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        throw new apiError(400, "Invalid order ID");
    }

    if (!status || !validStatuses.includes(status)) {
        throw new apiError(400, `Status must be one of: ${validStatuses.join(", ")}`);
    }

    // Find and update the order
    const order = await Order.findById(orderId);
    if (!order) {
        throw new apiError(404, "Order not found");
    }

    order.status = status;
    await order.save();

    // Update Redis
    if (["Delivered", "Cancelled"].includes(status)) {
        await clearOrderStatus(orderId);
    } else {
        await setOrderStatus(orderId, status);
    }

    // Emit real - time update
    const io = getIO();
    io.to(orderId).emit("order-status-update", {
        orderId,
        status
    });

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                order,
                "Order status updated successfully"
            )
        );
});
//Cancel Order
const cancelOrder = asyncHandler(async (req, res) => {
    const orderId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        throw new apiError(400, "Invalid order ID");
    }

    const order = await Order.findById(orderId);

    if (!order) {
        throw new apiError(404, "Order not found");
    }

    // Check if current user is the order owner or an admin
    const isOwner = order.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
        throw new apiError(403, "You are not authorized to cancel this order");
    }

    // Check order status
    if (order.status !== "Pending") {
        throw new apiError(400, `Order cannot be cancelled as it is already ${order.status}`);
    }

    order.status = "Cancelled";
    await order.save();

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                order,
                "Order cancelled successfully"
            )
        );
});

// accept order - for delivery partner
const acceptListedOrder = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const orderId = req.params.id;

    const user = await User.findById(userId)
    if (!user || user.role !== "deliveryPartner") {
        throw new apiError(
            400,
            "Only Delivery Partners can accept orders"
        )
    }
    const order = await Order.findById(orderId);
    if (!order) throw new apiError(404, "Order not found");
    if (order.status !== "Pending") throw new apiError(400, "Order already accepted");

    order.status = "Assigned";
    order.assignedTo = user._id;
    await order.save();

    return res.status(200).json(new apiResponse(200, order, "Order Processing"));
});

// getting the active orders
const getActiveOrders = asyncHandler(async (req, res) => {
    const activeOrders = await Order.aggregate([
        {
            $match: {
                status: { $in: ["Pending", "Processing"] }
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user"
            }
        },
        { $unwind: "$user" },
        {
            $unwind: "$items"
        },
        {
            $lookup: {
                from: "products",
                localField: "items.product",
                foreignField: "_id",
                as: "items.product"
            }
        },
        {
            $unwind: "$items.product"
        },
        {
            $group: {
                _id: "$_id",
                user: { $first: "$user" },
                totalAmount: { $first: "$totalAmount" },
                shippingAddress: { $first: "$shippingAddress" },
                paymentStatus: { $first: "$paymentStatus" },
                status: { $first: "$status" },
                createdAt: { $first: "$createdAt" },
                assignedTo: { $first: "$assignedTo" },
                items: { $push: "$items" }
            }
        },
        {
            $sort: { createdAt: -1 }
        }
    ]);

    return res.status(200).json(
        new apiResponse(
            200,
            activeOrders,
            "Fetched active orders (Pending/Processing)"
        )
    );
});

//get the live status of order
const getLiveOrderStatus = asyncHandler(async (req, res) => {
    const orderId = req.params.id;

    const redisStatus = await getOrderStatus(orderId);
    if (redisStatus) {
        return res.status(200).json(
            new apiResponse(200, redisStatus, "Live order status")
        );
    }

    const order = await Order.findById(orderId).select("status");
    if (!order) {
        throw new apiError(404, "Order not found");
    }

    return res.status(200).json(
        new apiResponse(200, { status: order.status }, "Order status from DB")
    );
});

const fetchLivePartnerLocation = asyncHandler(async (req, res) => {
    const orderId = req.params.id;
    console.log("rached here");
    const location = await getDeliveryLocation(orderId);
    console.log("fetching location from redis: ", location);
    if (!location) {
        return res.status(200).json(
            new apiResponse(200, null, "Location not available yet")
        );
    }

    return res.status(200).json(
        new apiResponse(200, location, "Live delivery location")
    );
});


export {
    createOrder, getUserOrderHistory, getSingleOrderById,
    updateOrderStatus, cancelOrder, acceptListedOrder, getActiveOrders, getLiveOrderStatus, fetchLivePartnerLocation
};