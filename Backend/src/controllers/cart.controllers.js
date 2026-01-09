import { asyncHandler } from "../utils/asyncHandler.js";
import { Cart } from "../models/cart.models.js";
import { Product } from "../models/product.models.js";
import { User } from "../models/user.models.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import redis from "../db/redis.js";

const addProductToCart = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
        throw new apiError(404, "Product not found");
    }

    /// REDIS CACHING for Cart Updates. ////
    const cartKey = `cart:${userId}`;

    // Increment quantity atomically
    await redis.hincrby(cartKey, productId, Math.max(1, quantity));

    // Optional: auto-expire cart after 24h inactivity
    await redis.expire(cartKey, 86400);

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                null,
                "Item added to cart"
            ));
});

const decreaseCartItemQuantity = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { productId } = req.body;

    // REDIS CACHE FOR CART
    const cartKey = `cart:${userId}`;
    const currentQty = await redis.hget(cartKey, productId);
    if (!currentQty) {
        throw new apiError(404, "Product not found in cart");
    }

    if (parseInt(currentQty) > 1) {
        await redis.hincrby(cartKey, productId, -1);
    } else {
        await redis.hdel(cartKey, productId);
    }
    await redis.expire(cartKey, 86400);

    // Old Mongo DB Logic
    // const cart = await Cart.findOne({ user: userId });

    // if (!cart) {
    //     throw new apiError(404, "Cart not found");
    // }

    // const itemIndex = cart.items.findIndex(
    //     item => item.product.toString() === productId
    // );

    // if (itemIndex === -1) {
    //     throw new apiError(404, "Product not found in cart");
    // }

    // if (cart.items[itemIndex].quantity > 1) {
    //     cart.items[itemIndex].quantity -= 1;
    // } else {
    //     // Remove item if quantity is 1
    //     cart.items.splice(itemIndex, 1);
    // }

    // await cart.save();

    return res.status(200).json(
        new apiResponse(200, null, "Item quantity updated in cart")
    );
});


const getCartInfo = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    if (req.user.role === "deliveryPartner") {
        return res
            .status(202)
            .json(
                new apiResponse(
                    202,
                    {},
                    "No requirement of cart"
                )
            )
    }
    //REDIS CACHE
    const cartKey = `cart:${userId}`;
    const cartItems = await redis.hgetall(cartKey);

    if (!cartItems || Object.keys(cartItems).length === 0) {
        return res.status(200).json(
            new apiResponse(200, { cart: [], total: 0 }, "Cart is empty")
        );
    }
    await redis.expire(cartKey, 86400); //refreshes the TTL for the cart every time this is called

    const productIds = Object.keys(cartItems);
    const products = await Product.find({ _id: { $in: productIds } })
        .select("productName price discount productImage")
        .lean();

    let total = 0;
    const cart = products.map(product => {
        const quantity = parseInt(cartItems[product._id]);
        const price = product.discount > 0
            ? product.price * (1 - product.discount / 100)
            : product.price;

        total += price * quantity;

        return {
            product,
            quantity,
            subtotal: price * quantity
        };
    });

    // OLD MONGO DB LOGIC
    // const cart = await Cart.findOne({ user: userId }).populate("items.product");
    // if (!cart) {
    //     throw new apiError(404, "Cart not found");
    // }

    // let total = 0;
    // cart.items.forEach(item => {
    //     const price = item.product.discount > 0
    //         ? item.product.price * (1 - item.product.discount / 100)
    //         : item.product.price;

    //     total += price * item.quantity;
    // });

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                { cart, total },
                "Cart fetched"
            ));
});

const removeAnItemFromCart = asyncHandler(async (req, res) => {
    const userId = req.user._id.toString();
    const productId = req.body.productId;

    if (!productId) {
        throw new apiError(400, "Product ID required");
    }

    const cartKey = `cart:${userId}`;
    await redis.hdel(cartKey, productId);

    // const cart = await Cart.findOne({ user: userId });
    // if (!cart) throw new apiError(404, "Cart not found");

    // cart.items = cart.items.filter(item => item.product.toString() !== productId);
    // await cart.save();

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                null,
                "Item removed"
            ));
});

const clearCart = asyncHandler(async (req, res) => {
    const userId = req.user._id.toString();

    await redis.del(`cart:${userId}`);

    return res.status(200).json(
        new apiResponse(200, null, "Cart cleared")
    );
});

export {
    addProductToCart,
    decreaseCartItemQuantity,
    getCartInfo,
    removeAnItemFromCart,
    clearCart
}