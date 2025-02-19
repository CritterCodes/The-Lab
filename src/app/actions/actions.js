"use server";

import { Client } from "square";
import { randomUUID } from "crypto";

// Ensure BigInt can be serialized in JSON responses
BigInt.prototype.toJSON = function () {
  return this.toString();
};

// Initialize Square API Client
const { paymentsApi } = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.SQUARE_ENVIRONMENT
});

/**
 * Processes a payment with Square's Payments API
 * @param {string} sourceId - The tokenized payment method
 * @param {number} amount - The amount to charge in cents
 * @param {string} currency - The currency code (e.g., USD)
 * @returns {Promise<object>} - Square payment response
 */
export async function submitPayment(sourceId, amount, currency = "USD") {
  try {
    console.log("🔹 Processing Payment...");

    const { result } = await paymentsApi.createPayment({
      idempotencyKey: randomUUID(),
      sourceId,
      amountMoney: {
        currency,
        amount,
      },
    });

    console.log("✅ Payment Success:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("❌ Payment Failed:", error);
    return { success: false, error: error.message };
  }
}
