import { Client, Environment } from "square";
import UserService from "../../users/service.js";
import AuthService from "@/app/api/auth/[...nextauth]/service.js";

export default class SubscriptionService {
  static processWebhook = async (payload) => {
    try {
      // Extract the customer_id from the nested payload.
      const customer_id = payload?.data?.object?.subscription?.customer_id;
      if (!customer_id) {
        throw new Error("Missing customer_id in webhook payload.");
      }

      // Initialize the Square client.
      const squareClient = new Client({
        environment:
          process.env.SQUARE_ENVIRONMENT === "production"
            ? Environment.Production
            : Environment.Sandbox,
        accessToken: process.env.SQUARE_ACCESS_TOKEN,
      });

      let customer;
      try {
        // Retrieve the full customer object from Square.
        const response = await squareClient.customersApi.retrieveCustomer(customer_id);
        customer = response.result.customer;
      } catch (error) {
        if (error.statusCode === 404) {
          console.warn(
            `Customer with ID ${customer_id} not found. It may not be created yet. Skipping update.`
          );
          return; // Optionally, implement a retry mechanism here.
        }
        throw error;
      }

      if (!customer || !customer.emailAddress) {
        throw new Error("Customer not found or missing email address in Square response.");
      }

      // Find the lab user with the matching email.
      const labUser = await UserService.getUserByQuery({ email: customer.emailAddress });
      if (!labUser) {
        throw new Error("No lab user found with matching email.");
      }

      // Encrypt the customer email to match the stored value.
      const encryptedEmail = AuthService.encryptEmail(customer.emailAddress);

      // Update the lab user with the Square customer_id using the encrypted email as query.
      const updatedUser = await UserService.updateUser(encryptedEmail, { squareID: customer_id });
      if (!updatedUser) {
        throw new Error("Failed to update lab user with squareID.");
      }

      console.log("Successfully updated lab user with squareID:", updatedUser);
      return updatedUser;
    } catch (error) {
      console.error("Error in SubscriptionService.processWebhook:", error);
      throw error;
    }
  }
}
