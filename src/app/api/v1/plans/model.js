import { db } from "@/lib/database";

export default class PlansModel {
  static async getPlans() {
    try {
      const dbPlans = await db.dbPlans();
      const plans = await dbPlans.find({}).toArray();
      return plans;
    } catch (error) {
      console.error("Error fetching plans:", error);
      throw new Error("Failed to fetch plans from the database.");
    }
  }
}