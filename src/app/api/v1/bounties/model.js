import { db } from "@/lib/database";

export default class BountyModel {
    static collectionName = "bounties";

    static async getCollection() {
        const database = await db.connect();
        return database.collection(this.collectionName);
    }

    static async createBounty(bounty) {
        const collection = await this.getCollection();
        const result = await collection.insertOne(bounty);
        return result.insertedId ? bounty : null;
    }

    static async getAllBounties(filter = {}) {
        const collection = await this.getCollection();
        return await collection.find(filter).sort({ createdAt: -1 }).toArray();
    }

    static async getBountyById(bountyID) {
        const collection = await this.getCollection();
        return await collection.findOne({ bountyID });
    }

    static async updateBounty(bountyID, updateData) {
        const collection = await this.getCollection();
        const result = await collection.updateOne(
            { bountyID },
            { $set: { ...updateData, updatedAt: new Date() } }
        );
        return result.modifiedCount > 0;
    }

    static async deleteBounty(bountyID) {
        const collection = await this.getCollection();
        const result = await collection.deleteOne({ bountyID });
        return result.deletedCount > 0;
    }
}
