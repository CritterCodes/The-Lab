// src/app/api/users/user.service.js

import User from "./class";
import UserModel from "./model";
import AuthService from '../../auth/[...nextauth]/service.js';
import DiscordService from "@/lib/discord";

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
                userData.username,
                userData.email,
                userData.password,
                userData.phoneNumber,
                userData?.role,
                userData?.status,
                userData?.provider,
                userData?.discordHandle,
                userData?.discordId,
                userData?.googleId,
                userData?.bio,
                userData?.skills,
                userData?.stake,
                userData?.image
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
     * @param {boolean} isPublic - If true, return only public users
     * @returns {Array} - List of all users
     */
    static getAllUsers = async (isPublic = false) => {
        try {
            const users = await UserModel.getAllUsers(isPublic);
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

            // 1. Fetch current user to calculate new status
            // We construct a search query that matches UserModel.getUserByQuery logic
            const searchObj = {
                userID: query,
                email: query,
                username: query,
                phoneNumber: query,
                firstName: query,
                lastName: query
            };
            
            const currentUser = await UserModel.getUserByQuery(searchObj);
            
            if (currentUser && updateData.membership) {
                // Merge membership data
                const mergedMembership = {
                    ...currentUser.membership,
                    ...updateData.membership,
                    accessKey: {
                        ...(currentUser.membership?.accessKey || {}),
                        ...(updateData.membership?.accessKey || {})
                    }
                };

                // Check if we should auto-update status
                const currentStatus = currentUser.membership?.status;
                const isManualStatus = currentStatus === 'probation' || currentStatus === 'suspended';
                
                // Only auto-calculate if not in a manual status, OR if the update explicitly changes status (which we can't easily detect here without comparing, but let's assume if they are in manual status we leave it unless they change it manually)
                // Actually, if the user is in probation, we shouldn't auto-promote them.
                
                if (!isManualStatus) {
                    let newStatus = 'registered';
                    
                    if (mergedMembership.applicationDate) newStatus = 'applicant';
                    if (mergedMembership.contacted) newStatus = 'contacted';
                    if (mergedMembership.onboardingComplete) newStatus = 'onboarding';
                    
                    // Check for probation eligibility (Waived or Active Subscription)
                    const isMember = mergedMembership.isWaived || (mergedMembership.sponsorshipExpiresAt && new Date(mergedMembership.sponsorshipExpiresAt) > new Date());
                    if (mergedMembership.onboardingComplete && isMember) newStatus = 'probation';

                    if (mergedMembership.accessKey?.issued) newStatus = 'active';

                    // Update the status in the merged membership
                    mergedMembership.status = newStatus;
                }
                
                // ✅ IMPORTANT: Update the updateData with the fully merged membership object
                // This prevents MongoDB from replacing the entire membership object with just the partial update
                updateData.membership = mergedMembership;
            }

            const updatedUser = await UserModel.updateUser(query, updateData);
            if(updatedUser) {
                updatedUser.email = AuthService.decryptEmail(updatedUser.email);
                if(updatedUser.phoneNumber) updatedUser.phoneNumber = AuthService.decryptPhone(updatedUser.phoneNumber);

                // ✅ Sync Discord Roles
                if (updatedUser.discordId) {
                    // Sync Creator Types
                    if (updatedUser.creatorType) {
                        DiscordService.syncCreatorRoles(updatedUser.discordId, updatedUser.creatorType)
                            .catch(err => console.error("Background Creator Role Sync Failed:", err));
                    }
                    
                    // Sync Membership Role (LabRatz)
                    if (updatedUser.membership?.status) {
                        DiscordService.syncMembershipRole(updatedUser.discordId, updatedUser.membership.status)
                            .catch(err => console.error("Background Membership Role Sync Failed:", err));
                    }
                }
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

    /**
     * ✅ Merge two users
     * Moves data from sourceUser to targetUser and deletes sourceUser
     * @param {string} targetUserID - The ID of the user to keep
     * @param {string} sourceUserID - The ID of the user to delete
     */
    static mergeUsers = async (targetUserID, sourceUserID) => {
        try {
            console.log(`🔀 Merging User ${sourceUserID} into ${targetUserID}`);
            
            const targetUser = await this.getUserByQuery({ userID: targetUserID });
            const sourceUser = await this.getUserByQuery({ userID: sourceUserID });

            if (!targetUser || !sourceUser) {
                throw new Error("One or both users not found.");
            }

            // Fields to copy if missing in target
            const fieldsToMerge = [
                'discordHandle', 'discordId', 'googleId', 'phoneNumber', 
                'firstName', 'lastName', 'image', 'bio', 'hobbies', 'creatorType',
                'cityChange', 'knownMembers', 'questions'
            ];

            const updateData = {};
            fieldsToMerge.forEach(field => {
                if (!targetUser[field] && sourceUser[field]) {
                    updateData[field] = sourceUser[field];
                }
            });

            // If source has a provider and target doesn't (or target is local), update provider
            if (sourceUser.provider && (!targetUser.provider || targetUser.provider === 'local')) {
                updateData.provider = sourceUser.provider;
            }

            // Update target user
            if (Object.keys(updateData).length > 0) {
                console.log("Updating target user with:", updateData);
                await this.updateUser(targetUserID, updateData);
            }

            // Delete source user
            console.log("Deleting source user:", sourceUserID);
            await this.deleteUser({ userID: sourceUserID });

            return await this.getUserByQuery({ userID: targetUserID });

        } catch (error) {
            console.error("❌ Error in UserService.mergeUsers:", error);
            throw error;
        }
    }
}
