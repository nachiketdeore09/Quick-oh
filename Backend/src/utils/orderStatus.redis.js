import redis from "../db/redis.js";

export const setOrderStatus = async (orderId, status) => {
    const key = `order:status:${orderId}`;
    await redis.set(
        key,
        {
            status,
            updatedAt: Date.now(),
        },
        {
            ex: 86400, // 24 hours
        }
    );
};

export const getOrderStatus = async (orderId) => {
    const key = `order:status:${orderId}`;
    return await redis.get(key);
};

export const clearOrderStatus = async (orderId) => {
    const key = `order:status:${orderId}`;
    await redis.del(key);
};
