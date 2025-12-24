// src/app/api/users/user.model.js
import { db } from "@/lib/database";


export default class UserModel {
    /**
     * ✅ Create a new user
     * @param {Object} user - The user object to create
     * @returns {Object|null} - The created user or null if failed
     */
    static createUser = async (user) => {
        try {
            const dbUsers = await db.dbUsers();
            const results = await dbUsers.insertOne(user);
            if (!results.insertedId) {
                throw new Error("Failed to insert user.");
            }
            return user;
        } catch (error) {
            console.error("Error creating user:", error);
            return new Response(
                JSON.stringify({ error: "Error creating user", details: error.message }),
                { status: 500 }
            );
        }
    }

    /**
     * ✅ Get a single user by any query parameter
     * @param {Object} query - Query object to search for a user
     * @returns {Object|null} - The found user or null if not found
     */
    static getUserByQuery = async (query) => {
        try {
            const dbUsers = await db.dbUsers();
            console.log("🔍 Searching user in the database with query:", query);

            const user = await dbUsers.findOne({
                $or: Object.keys(query).map(key => ({ [key]: { $regex: query[key], $options: "i" } }))
            });

            if (!user) {
                console.warn("⚠️ No user found in database for query:", query);
            } else {
                console.log("✅ User found in database:", user);
            }
            
            return user;
        } catch (error) {
            console.error("❌ Error retrieving user from database:", error);
            return null;
        }
    }

    /**
     * ✅ Get all users
     * @param {boolean} isPublic - If true, return only public users who are active or on probation
     * @returns {Array} - Array of all users
     */
    static getAllUsers = async (isPublic = false) => {
        try {
            const dbUsers = await db.dbUsers();
            const filter = isPublic ? { 
                isPublic: true,
                "membership.status": { $in: ["active", "probation"] }
            } : {};
            const users = await dbUsers.find(filter).toArray();
            return users;
        } catch (error) {
            console.error("Error retrieving all users:", error);
            return [];
        }
    }

    /**
     * ✅ Update a user's data
     * @param {Object} query - Query to find the user
     * @param {Object} updateData - Data to update
     * @returns {Object|null} - Updated user data or null if failed
     */
    static updateUser = async (query, updateData) => {
        try {
            console.log("🔄 Updating user with query:", query);
            console.log("🔄 Update data:", updateData);

            // Exclude the _id field from the updateData object
            const { _id, ...updateFields } = updateData;

            const dbUsers = await db.dbUsers();
            const result = await dbUsers.updateOne(
                {
                    $or: [
                        { firstName: { $regex: query, $options: "i" } },
                        { lastName: { $regex: query, $options: "i" } },
                        { email: { $regex: query, $options: "i" } },
                        { phoneNumber: { $regex: query, $options: "i" } },
                        { userID: { $regex: query, $options: "i" } }
                    ]
                },
                { $set: updateFields }
            );

            if (result.matchedCount === 0) {
                throw new Error("No user found to update.");
            }

            const updatedUser = await dbUsers.findOne({
                $or: [
                    { firstName: { $regex: query, $options: "i" } },
                    { lastName: { $regex: query, $options: "i" } },
                    { email: { $regex: query, $options: "i" } },
                    { phoneNumber: { $regex: query, $options: "i" } },
                    { userID: { $regex: query, $options: "i" } }
                ]
            });
            return updatedUser;
        } catch (error) {
            console.error("Error updating user:", error);
            return null;
        }
    }

    /**
     * ✅ Delete a user
     * @param {Object} query - Query to find the user
     * @returns {Boolean} - True if deletion was successful, false otherwise
     */
    static deleteUser = async (query) => {
        try {
            const dbUsers = await db.dbUsers();
            const result = await dbUsers.deleteOne(query);
            return result.deletedCount > 0;
        } catch (error) {
            console.error("Error deleting user:", error);
            return false;
        }
    }
}
