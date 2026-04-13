import { redisConnection } from "./redis.connection.js";

// We consolidate to use the ioredis (TCP) connection for everything
// as the REST client was failing on Render.
const redis = redisConnection;

if (!redis) {
    console.error("CRITICAL: Redis connection not established. Check REDIS_URL in .env");
}

export default redis;