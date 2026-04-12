import { Worker } from "bullmq";
import { redisConnection } from "../db/redis.connection.js";
import { getIO } from "../utils/socket.io.js";
import { User } from "../models/user.models.js";

export const initOrderWorker = () => {
    if (!redisConnection) return;

    const worker = new Worker("orderQueue", async (job) => {
        const { type, data } = job.data;
        const io = getIO();

        console.log(`Processing Order Job: ${type} - ${job.id}`);

        if (type === "newOrderNotification") {
            // Data has { orderId, shippingAddress, totalAmount, createdAt }
            io.to("admin-room").emit("newOrder", {
                message: "New customer order pending acceptance",
                ...data
            });
        } 
        
        else if (type === "adminAcceptNotification") {
            // Data has { orderId, shippingAddress, totalAmount }
            const deliveryPartners = await User.find({
                role: "deliveryPartner",
                isAvailable: true
            });

            deliveryPartners.forEach(partner => {
                io.to(`delivery-partner-${partner._id}`).emit("newOrder", {
                    message: "New order available for delivery",
                    ...data
                });
            });
        }

        else if (type === "statusUpdateNotification") {
            // Data has { orderId, status }
            io.to(data.orderId).emit("order-status-update", {
                orderId: data.orderId,
                status: data.status
            });
        }

    }, { connection: redisConnection });

    worker.on("completed", (job) => {
        console.log(`Order Job ${job.id} completed`);
    });

    worker.on("failed", (job, err) => {
        console.error(`Order Job ${job.id} failed:`, err);
    });

    return worker;
};
