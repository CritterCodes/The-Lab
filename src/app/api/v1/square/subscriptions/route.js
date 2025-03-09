import express from "express";
import { handleSquareWebhook } from "./controller";

const router = express.Router();

router.options("/webhook", (req, res) => {
    // Allow preflight requests
    res.sendStatus(200);
});

// Route to handle Square Webhooks
router.post("/webhook", express.json(), handleSquareWebhook);

export default router;
