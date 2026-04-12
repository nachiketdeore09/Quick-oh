import { Queue } from "bullmq";
import { redisConnection } from "../db/redis.connection.js";

// Queue for Order notifications and status updates
export const orderQueue = redisConnection ? new Queue("orderQueue", {
    connection: redisConnection,
}) : null;

// Helper to add jobs to orderQueue
export const addOrderJob = async (type, data) => {
    if (!orderQueue) return;
    await orderQueue.add(type, data, {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 1000,
        },
    });
};
