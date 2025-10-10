import express from "express";
import { createPaymentOrder, createPaymentLink, updatePaymentStatus } from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create-order", createPaymentOrder);

router.post("/create-payment-link", createPaymentLink)

router.post("/mark-paid/", updatePaymentStatus);

export default router;