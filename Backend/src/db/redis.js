import Redis from "ioredis";

let redis;

if (!redis) {
    redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: null,
        enableReadyCheck: true,
    });

    redis.on("connect", () => {
        console.log("✅ Redis connected");
    });

    redis.on("error", (err) => {
        console.error("❌ Redis error", err.message);
    });
}

export default redis;