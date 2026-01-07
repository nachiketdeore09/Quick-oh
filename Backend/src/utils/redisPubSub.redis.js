import redis from "../db/redis.js";

const pubClient = redis;
const subClient = redis.duplicate();

// await pubClient.connect();
// await subClient.connect();

subClient.on("connect", () => {
    console.log("✅ Redis subClient connected");
});

subClient.on("error", (err) => {
    console.error("❌ Redis subClient error", err.message);
});

export { pubClient, subClient };
