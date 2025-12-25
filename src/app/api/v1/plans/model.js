import { db } from "@/lib/database";
import fs from 'fs';
import path from 'path';

export default class PlansModel {
  static async getPlans() {
    try {
      const dbPlans = await db.dbPlans();
      let plans = await dbPlans.find({}).toArray();
      
      if (!plans || plans.length === 0) {
          console.log("⚠️ No plans in DB, falling back to plans.json");
          try {
              const plansPath = path.join(process.cwd(), 'plans.json');
              const fileContents = fs.readFileSync(plansPath, 'utf8');
              plans = JSON.parse(fileContents);
          } catch (err) {
              console.error("Failed to read plans.json", err);
          }
      }
      
      return plans;
    } catch (error) {
      console.error("Error fetching plans:", error);
      throw new Error("Failed to fetch plans from the database.");
    }
  }
}