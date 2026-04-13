import { z } from "zod";

export const createProductSchema = z.object({
    body: z.object({
        productName: z.string().min(2, "Product name too short"),
        description: z.string().min(5, "Description too short"),
        productCategory: z.string().min(1, "Category is required"),
        price: z.string().or(z.number()).transform(val => Number(val)),
        discount: z.string().or(z.number()).transform(val => Number(val)).optional(),
        stock: z.enum(["Available", "Out Of Stock", "Very Few Remaining"]),
    }).passthrough() // Allow extra fields like vendor or images if needed
});

export const updateProductSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Product ID format"),
    }),
    body: z.object({
        productName: z.string().min(2).optional(),
        description: z.string().min(5).optional(),
        price: z.string().or(z.number()).transform(val => Number(val)).optional(),
        discount: z.string().or(z.number()).transform(val => Number(val)).optional(),
    }).strict()
});
