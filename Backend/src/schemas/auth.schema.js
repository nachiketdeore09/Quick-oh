import { z } from "zod";

export const registerSchema = z.object({
    body: z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email format"),
        phoneNumber: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        role: z.enum(["customer", "admin", "vendor", "deliveryPartner"]).optional(),
    })
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email format"),
        password: z.string().min(1, "Password is required"),
    })
});
