// src/app/api/users/user.service.js

import User from "./class";
import UserModel from "./model";
import AuthService from '../../auth/[...nextauth]/service.js';

export default class UserService {
    /**
     * ✅ Create a new user
     * @param {Object} userData - The data required to create a user
     * @returns {Object|null} - Created user or null if failed
     */
    static createUser = async (userData) => {
        try {
            // Encrypt email and phone before creating a new user
            if(userData.email) userData.email = AuthService.encryptEmail(userData.email);
            if(userData.phoneNumber) userData.phoneNumber = AuthService.encryptPhone(userData.phoneNumber);
            userData.password = '';
            // Validate the required fields through the User class
            const newUser = new User(
                userData.firstName,
                userData.lastName,
                userData.email,
                userData.password,
                userData.phoneNumber,
                userData?.role,
                userData?.business,
                userData?.status
            );
            return await UserModel.createUser(newUser);
        } catch (error) {
            console.error("Error in UserService.createUser:", error);
            throw new Error("Failed to create user.");
        }
    }

    /**
     * ✅ Fetch a user based on a query
     * @param {Object} query - The query to find a user
     * @returns {Object|null} - User data or null if not found
     */
    static getUserByQuery = async (query) => {
        try {
            // Encrypt email in query if present
            if (query.email) query.email = AuthService.encryptEmail(query.email);
            console.log("🔍 Fetching user in UserService for query:", query);
            const user = await UserModel.getUserByQuery(query); 
            if (user) {
                user.email = AuthService.decryptEmail(user.email);
                if (user.phoneNumber) user.phoneNumber = AuthService.decryptPhone(user.phoneNumber);
                console.log("✅ User found in service:", user);
            } else {
                console.warn("⚠️ No user found in service.");
            }
            return user;
        } catch (error) {
            console.error("❌ Error in UserService.getUserByQuery:", error);
            throw new Error("Failed to fetch user.");
        }
    }
    
    

    /**
     * ✅ Fetch all users
     * @returns {Array} - List of all users
     */
    static getAllUsers = async () => {
        try {
            const users = await UserModel.getAllUsers();
            const decryptedUsers = users.map(user => {
                // Decrypt fields for each user
                user.email = AuthService.decryptEmail(user.email);
                if(user.phoneNumber) user.phoneNumber = AuthService.decryptPhone(user.phoneNumber);
                return user;
            });
            return decryptedUsers;
        } catch (error) {
            console.error("Error in UserService.getAllUsers:", error);
            throw new Error("Failed to fetch all users.");
        }
    }

    /**
     * ✅ Update a user's data
     * @param {Object} query - Query to find the user
     * @param {Object} updateData - Data to update
     * @returns {Object|null} - Updated user or null if failed
     */
    static updateUser = async (query, updateData) => {
        try {
            // Encrypt email and phone in updateData if present
            if(updateData.email) updateData.email = AuthService.encryptEmail(updateData.email);
            if(updateData.phoneNumber) updateData.phoneNumber = AuthService.encryptPhone(updateData.phoneNumber);
            const updatedUser = await UserModel.updateUser(query, updateData);
            if(updatedUser) {
                updatedUser.email = AuthService.decryptEmail(updatedUser.email);
                if(updatedUser.phoneNumber) updatedUser.phoneNumber = AuthService.decryptPhone(updatedUser.phoneNumber);
            }
            return updatedUser;
        } catch (error) {
            console.error("Error in UserService.updateUser:", error);
            throw new Error("Failed to update user.");
        }
    }

    /**
     * ✅ Delete a user
     * @param {Object} query - Query to identify the user
     * @returns {Boolean} - True if deletion was successful, false otherwise
     */
    static deleteUser = async (query) => {
        try {
            const deletionResult = await UserModel.deleteUser(query);
            return deletionResult;
        } catch (error) {
            console.error("Error in UserService.deleteUser:", error);
            throw new Error("Failed to delete user.");
        }
    }
}
