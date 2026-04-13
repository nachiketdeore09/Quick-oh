import { apiError } from "../utils/apiError.js";

/**
 * Middleware factory for Zod validation
 * @param {import('zod').ZodSchema} schema 
 */
export const validate = (schema) => (req, res, next) => {
    try {
        const result = schema.safeParse({
            body: req.body,
            query: req.query,
            params: req.params,
        });

        if (!result.success) {
            const errorMessages = result.error.errors.map((err) => `${err.path.join(".")}: ${err.message}`);
            throw new apiError(400, `Validation Failed: ${errorMessages.join(", ")}`);
        }

        // Replace req data with validated data (strips unknown fields)
        req.body = result.data.body;
        req.query = result.data.query;
        req.params = result.data.params;
        
        next();
    } catch (error) {
        next(error);
    }
};
