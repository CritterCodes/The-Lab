import { Client, Environment } from "square";
import UserService from "../../users/service";

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
  
        // Retrieve the full customer object from Square.
        const response = await squareClient.customersApi.retrieveCustomer(customer_id);
        const customer = response.result.customer;
        if (!customer || !customer.emailAddress) {
          throw new Error("Customer not found or missing email address in Square response.");
        }

        console.log("Retrieved customer from Square:", customer);
  
        // Find the lab user with the matching email.
        const labUser = await UserService.getUserByQuery({ email: customer.emailAddress });
        if (!labUser) {
          throw new Error("No lab user found with matching email.");
        }
        
        console.log("Found lab user with matching email:", labUser);
  
        // Update the lab user with the Square customer_id.
        const updatedUser = await UserService.updateUser(customer.emailAddress, { squareID: customer_id });
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