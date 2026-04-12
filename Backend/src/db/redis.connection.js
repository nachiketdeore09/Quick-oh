import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
    console.warn("WARNING: REDIS_URL not found in .env. BullMQ will not function correctly.");
}

// We use ioredis for BullMQ as it requires TCP/real Redis protocol (not REST)
export const redisConnection = redisUrl ? new Redis(redisUrl, {
    maxRetriesPerRequest: null, // Required by BullMQ
}) : null;

if (redisConnection) {
    redisConnection.on("error", (err) => {
        console.error("Redis Connection Error (BullMQ):", err);
    });
    
    redisConnection.on("connect", () => {
        console.log("Redis Connected (BullMQ)");
    });
}
