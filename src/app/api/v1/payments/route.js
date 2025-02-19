// src/pages/api/payments/create.js
import squareClient from "../../../../lib/square";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { amount, customerId } = req.body; // Adjust based on your payload

  try {
    const paymentsApi = squareClient.paymentsApi;
    const response = await paymentsApi.createPayment({
      idempotencyKey: crypto.randomUUID(), // Ensure unique key for each request
      amountMoney: {
        amount: amount, // Amount in cents (e.g., $10.00 => 1000)
        currency: "USD",
      },
      sourceId: "source_id_from_square_frontend", // From Square payment form
      customerId: customerId, // Optional
    });

    res.status(200).json(response);
  } catch (error) {
    console.error("Square Payment Error:", error);
    res.status(500).json({ error: error.message });
  }
}
