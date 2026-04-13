import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import hpp from "hpp";

const app = express();

// Security Headers
app.use(helmet());

// Response Compression
app.use(compression());

// Prevent HTTP Parameter Pollution
app.use(hpp());

const allowedOrigins = process.env.CORS_ORIGIN === "*"
    ? true   // 'true' reflects the request origin — required when credentials: true
    : [process.env.CORS_ORIGIN, "http://localhost:3000", "http://localhost:5173", "https://quick-oh.vercel.app"].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}))

//used to access cookies from the browser to perform CRED opertaions
app.use(cookieParser())

// size limit for json that server will accept
app.use(express.json(
    {
        limit: "16kb",
    }
))



// configuration to handle url response and changes done in url
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

//this configuration is used to stored the img,svg,etc in a public folder in server
app.use(express.static("public"))



//import routes
import userRouter from "./routes/user.routes.js";
import productRouter from "./routes/product.routes.js";
import categoryRouter from "./routes/category.routes.js"
import cartRouter from "./routes/cart.routes.js";
import orderRouter from "./routes/order.routes.js";
import geoCodesRouter from "./routes/geoCodes.routes.js";
import paymentRoutes from "./routes/payments.routes.js";

// it will handle all the routes related to "/api/v1/users" by calling different routes from the given router
app.use("/api/v1/users", userRouter);

//it will handle all the routes related to all product related controllers
app.use("/api/v1/products", productRouter);

// handles all the routes related to all category related controllers.
app.use("/api/v1/category", categoryRouter);

app.use("/api/v1/cart", cartRouter);

app.use("/api/v1/order", orderRouter);

//for the maps
app.use("/api/v1/maps", geoCodesRouter);

//for payment
app.use("/api/v1/payment", paymentRoutes);

export { app };