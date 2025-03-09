import crypto from "crypto";
import UserModel from "../../users/model";

// Load environment variables
const SQUARE_SUB_SIGKEY = process.env.SQUARE_SUB_SIGKEY;

/**
 * ✅ Verify Square Webhook Signature
 */
function verifySquareSignature(req, res, next) {
    const signature = req.headers["x-square-hmacsha256-signature"];
    const requestBody = JSON.stringify(req.body);
    const hmac = crypto.createHmac("sha256", SQUARE_SUB_SIGKEY);
    hmac.update(requestBody);
    const expectedSignature = hmac.digest("base64");

    if (signature !== expectedSignature) {
        console.error("🚨 Webhook Signature Verification Failed!");
        return res.status(401).json({ error: "Invalid signature" });
    }
    console.log("✅ Webhook Signature Verified");
    next();
}

/**
 * ✅ Handle Incoming Square Webhook
 */
export async function handleSquareWebhook(req, res) {
    try {
        const eventType = req.body.type;
        const data = req.body.data.object;

        console.log("🔔 Square Webhook Received:", eventType);
        console.log("📦 Webhook Data:", data);

        if (eventType === "subscription.created" || eventType === "invoice.payment_made") {
            const squareEmail = data.customer_email;
            const squareCustomerId = data.customer_id;

            if (!squareEmail || !squareCustomerId) {
                console.error("❌ Missing Square email or customer ID.");
                return res.status(400).json({ error: "Missing customer data" });
            }

            // ✅ Find Lab user by email (pass as string for regex matching)
            const user = await UserModel.getUserByQuery(squareEmail);
            if (!user) {
                console.error("⚠️ No matching Lab user found for Square email:", squareEmail);
                return res.status(404).json({ error: "User not found" });
            }

            // ✅ Update Lab user with Square ID
            await UserModel.updateUser(squareEmail, { squareID: squareCustomerId });

            console.log(`✅ Successfully linked Square account (${squareCustomerId}) to Lab user (${squareEmail}).`);
            return res.status(200).json({ success: true });
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("❌ Error handling Square Webhook:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
