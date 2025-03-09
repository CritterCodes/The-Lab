import express from "express";
import { handleSquareWebhook } from "./squareWebhook.controller.js";

const router = express.Router();

// Route to handle Square Webhooks
router.post("/webhook", express.json(), handleSquareWebhook);

export default router;
