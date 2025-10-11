import razorpay from "../utils/razorPayInstance.js";
import { Order } from "../models/order.models.js"
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js"

const createPaymentOrder = async (req, res) => {
    try {
        const { amount } = req.body;

        const options = {
            amount: amount * 100, // amount in smallest currency unit (paise)
            currency: "INR",
            receipt: `receipt_order_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        res.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID,
        });
    } catch (err) {
        console.error("Razorpay Error:", err);
        res.status(500).json({ success: false, error: "Payment order creation failed" });
    }
};

const createPaymentLink = async (req, res) => {
    const { amount, customerName, customerEmail, customerContact, orderId } = req.body;

    try {
        const paymentLink = await razorpay.paymentLink.create({
            amount: amount * 100, // convert to paise
            currency: "INR",
            accept_partial: false,
            description: "Delivery Payment",
            customer: {
                name: customerName,
                contact: customerContact,
                email: customerEmail,
            },
            notify: {
                sms: true,
                email: true,
            },
            // reminder_enable: true,
            callback_url: "http://localhost:5173/shop",
            callback_method: "get",
        });

        res.json(paymentLink);
    } catch (error) {
        console.error("Failed to create payment link:", error);
        res.status(500).json({ error: "Failed to create payment link" });
    }
}

const updatePaymentStatus = async (req, res) => {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            throw new apiError(404, "No such Order found")
        }

        const order = await Order.findById(orderId);
        if (!order) {
            throw new apiError(404, "No such order")
        };

        order.paymentStatus = "Completed";
        await order.save();

        return res
            .status(200)
            .json(
                new apiResponse(
                    200,
                    order,
                    "Status Updated successfully"
                )
            );
    } catch (err) {
        console.error("Error updating payment status:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

export { createPaymentOrder, createPaymentLink, updatePaymentStatus }