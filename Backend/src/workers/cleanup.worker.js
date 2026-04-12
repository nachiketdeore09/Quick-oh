import { Worker } from "bullmq";
import { redisConnection } from "../db/redis.connection.js";
import { deleteFromCloudinary } from "../cloudinary.js";

export const initCleanupWorker = () => {
    if (!redisConnection) return;

    const worker = new Worker("cleanupQueue", async (job) => {
        const { type, data } = job.data;

        console.log(`Processing Cleanup Job: ${type} - ${job.id}`);

        if (type === "deleteCloudinaryAsset") {
            // Data has { imageUrl }
            if (data.imageUrl) {
                await deleteFromCloudinary(data.imageUrl);
                console.log(`Cloudinary asset deleted: ${data.imageUrl}`);
            }
        }

    }, { connection: redisConnection });

    worker.on("completed", (job) => {
        console.log(`Cleanup Job ${job.id} completed`);
    });

    worker.on("failed", (job, err) => {
        console.error(`Cleanup Job ${job.id} failed:`, err);
    });

    return worker;
};
