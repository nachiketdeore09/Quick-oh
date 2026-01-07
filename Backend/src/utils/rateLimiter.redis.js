import redis from "../db/redis.js";
import { apiError } from "./apiError.js";



export const rateLimiter = ({
    keyPrefix,
    limit,
    windowSeconds,
    identifier = "ip"
}) => {
    return async (req, res, next) => {
        try {
            if (!redis || redis.status !== "ready") {
                return next();
            }

            const id =
                identifier === "user"
                    ? req.user?._id?.toString()
                    : req.ip;

            if (!id) return next();

            const key = `rate:${keyPrefix}:${id}`;

            const current = await redis.incr(key);

            if (current === 1) {
                await redis.expire(key, windowSeconds);
            }

            if (current > limit) {
                throw new apiError(
                    429,
                    "Too many requests. Please slow down."
                );
            }

            next();
        } catch (err) {
            next(err);
        }
    };
};

// limits the sockets requests
export const socketRateLimiter = async ({
    socket,
    action,
    limit,
    windowSeconds
}) => {
    if (!redis || redis.status !== "ready") {
        return true;
    }

    const userId = socket.user?.id || socket.id;
    const key = `rate:socket:${action}:${userId}`;

    const count = await redis.incr(key);

    if (count === 1) {
        await redis.expire(key, windowSeconds);
    }

    return count <= limit;
};

