import redis from "../db/redis.js";

export const setDeliveryLocation = async (orderId, latitude, longitude) => {
    const key = `delivery:location:${orderId}`;

    try {
        await redis.hset(key, {
            lat: String(latitude),
            lng: String(longitude),
            updatedAt: String(Date.now())
        });
        // Auto-cleanup after 1 day
        await redis.expire(key, 86400);
    } catch (err) {
        console.error("Failed to set delivery location:", err.message);
    }
};

export const getDeliveryLocation = async (orderId) => {
    const key = `delivery:location:${orderId}`;
    try {
        const data = await redis.hgetall(key);

        if (!data || !data.lat) return null;
        return {
            latitude: Number(data.lat),
            longitude: Number(data.lng),
            updatedAt: Number(data.updatedAt)
        };
    } catch (err) {
        console.error("Failed to fetch delivery location:", err.message);
        return null;
    }
};

export const clearDeliveryLocation = async (orderId) => {
    try {
        await redis.del(`delivery:location:${orderId}`);
    } catch (err) {
        console.error("Failed to clear delivery location:", err.message);
    }
};
