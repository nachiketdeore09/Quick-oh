import redis from "../db/redis.js";

export const setDeliveryLocation = async (orderId, latitude, longitude) => {
    const key = `delivery:location:${orderId}`;

    await redis.hset(key, {
        lat: latitude,
        lng: longitude,
        updatedAt: Date.now()
    });
    // Auto-cleanup after 1 day
    await redis.expire(key, 86400);
};

export const getDeliveryLocation = async (orderId) => {
    const key = `delivery:location:${orderId}`;
    const data = await redis.hgetall(key);

    if (!data || !data.lat) return null;
    return {
        latitude: parseFloat(data.lat),
        longitude: parseFloat(data.lng),
        updatedAt: Number(data.updatedAt)
    };
};

export const clearDeliveryLocation = async (orderId) => {
    await redis.del(`delivery:location:${orderId}`);
};
