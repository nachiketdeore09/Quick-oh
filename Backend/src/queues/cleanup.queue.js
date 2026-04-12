import { Queue } from "bullmq";
import { redisConnection } from "../db/redis.connection.js";

// Queue for asset cleanup (Cloudinary)
export const cleanupQueue = redisConnection ? new Queue("cleanupQueue", {
    connection: redisConnection,
}) : null;

export const addCleanupJob = async (type, data) => {
    if (!cleanupQueue) return;
    await cleanupQueue.add(type, data, {
        attempts: 5,
        backoff: {
            type: "exponential",
            delay: 2000,
        },
    });
};
