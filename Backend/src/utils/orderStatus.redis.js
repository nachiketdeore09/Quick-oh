import redis from "../db/redis.js";

export const setOrderStatus = async (orderId, status) => {
    const key = `order:status:${orderId}`;
    await redis.set(
        key,
        JSON.stringify({
            status,
            updatedAt: Date.now()
        }),
        "EX",
        86400 // 24 hours
    );
};

export const getOrderStatus = async (orderId) => {
    const data = await redis.get(`order:status:${orderId}`);
    return data ? JSON.parse(data) : null;
};

export const clearOrderStatus = async (orderId) => {
    await redis.del(`order:status:${orderId}`);
};
