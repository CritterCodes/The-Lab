import axiosInstance from "@/utils/axiosInstance";

/**
 * Service to handle membership-related API interactions
 */
class MembershipService {
  /**
   * Fetch all available membership plans
   * @returns {Promise<Object[]>} - Array of membership plans
   */
  static getMembershipPlans = async () => {
    try {
      const response = await axiosInstance.get("/memberships");
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching membership plans:", error);
      throw error;
    }
  };

  /**
   * Subscribe user to a membership plan
   * @param {string} userID - The user ID
   * @param {string} planId - The selected membership plan ID
   * @returns {Promise<Object>} - Subscription confirmation
   */
  static subscribeToPlan = async (userID, planId) => {
    try {
      const response = await axiosInstance.post("/memberships", {
        userID,
        planId,
      });
      return response.data;
    } catch (error) {
      console.error("❌ Error subscribing to membership:", error);
      throw error;
    }
  };

  /**
   * Cancel user's membership
   * @param {string} userID - The user ID
   * @returns {Promise<Object>} - Cancellation confirmation
   */
  static cancelMembership = async (userID) => {
    try {
      const response = await axiosInstance.delete("/memberships/cancel", {
        data: { userID },
      });
      return response.data;
    } catch (error) {
      console.error("❌ Error canceling membership:", error);
      throw error;
    }
  };

  /**
   * Add or remove locker add-on for user
   * @param {string} userID - The user ID
   * @param {string} action - "add" or "remove"
   * @returns {Promise<Object>} - Locker status confirmation
   */
  static updateLockerStatus = async (userID, action) => {
    try {
      const response = await axiosInstance.put("/memberships/locker", {
        userID,
        action,
      });
      return response.data;
    } catch (error) {
      console.error("❌ Error updating locker status:", error);
      throw error;
    }
  };
}

export default MembershipService;
