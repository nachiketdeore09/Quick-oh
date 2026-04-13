import { z } from "zod";

export const createOrderSchema = z.object({
    body: z.object({
        address: z.string().min(5, "Address too short"),
        latitude: z.number(),
        longitude: z.number(),
    })
});

export const updateOrderStatusSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Order ID format"),
    }),
    body: z.object({
        status: z.enum(["Pending", "Accepted", "Assigned", "Processing", "Shipped", "Delivered", "Cancelled"]),
    })
});
