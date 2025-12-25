import Bounty from "./class";
import BountyModel from "./model";
import UserModel from "../users/model";
import NotificationService from "../notifications/service";
import AuthService from "../../auth/[...nextauth]/service";
import { 
    sendBountyNotificationEmail, 
    sendBountyClaimedEmail, 
    sendBountySubmittedEmail, 
    sendBountyVerifiedEmail 
} from "../../../utils/email.util";
import { v4 as uuidv4 } from 'uuid';

export default class BountyService {
    static async createBounty(data) {
        // Calculate total stake: Base (3) + Additional
        const baseStake = 3;
        const additionalStake = Number(data.stakeValue) || 0;
        const totalStake = baseStake + additionalStake;

        // If additional stake is offered by a non-admin, deduct it from their account
        // Note: We need to fetch the user to check role and balance
        // For now, assuming the controller/frontend handles the role check or we trust the input?
        // Better to check here.
        
        if (additionalStake > 0) {
            const creator = await UserModel.getUserByQuery({ userID: data.creatorID });
            if (creator && creator.role !== 'admin') {
                if ((creator.stake || 0) < additionalStake) {
                    throw new Error(`Insufficient stake. You have ${creator.stake || 0}, but tried to offer ${additionalStake} additional stake.`);
                }
                
                // Deduct stake
                await UserModel.updateUser(
                    { userID: data.creatorID }, 
                    { stake: (creator.stake || 0) - additionalStake }
                );
            }
        }

        const bounty = new Bounty(
            data.title,
            data.description,
            data.creatorID,
            data.rewardType,
            data.rewardValue,
            totalStake, // Store the total value
            data.requirements,
            data.recurrence,
            data.startsAt
        );
        
        const createdBounty = await BountyModel.createBounty(bounty);

        // Notify all active members (Awaiting to ensure execution in serverless env)
        try {
            console.log("🔔 Starting notification process for new bounty:", bounty.title);
            console.log("🔔 Creator ID:", data.creatorID);
            
            const activeMembers = await UserModel.getActiveMembers();
            console.log(`🔔 Found ${activeMembers.length} active members to notify.`);
            
            const notifications = [];
            
            for (const member of activeMembers) {
                // Don't notify the creator (Commented out for testing purposes)
                // if (member.userID === data.creatorID) {
                //     console.log(`🔔 Skipping notification for creator: ${member.userID}`);
                //     continue;
                // }

                // 1. In-app Notification
                notifications.push(NotificationService.create({
                    userID: member.userID,
                    type: 'info',
                    title: 'New Bounty Available',
                    message: `New bounty posted: ${bounty.title}`,
                    link: `/dashboard/bounties?highlight=${bounty.bountyID}`,
                    metadata: { bountyID: bounty.bountyID }
                }));

                // 2. Email Notification
                if (member.email) {
                    try {
                        const decryptedEmail = AuthService.decryptEmail(member.email);
                        if (decryptedEmail) {
                            console.log(`📧 Queuing email for ${decryptedEmail} (${member.firstName})`);
                            notifications.push(sendBountyNotificationEmail(decryptedEmail, member.firstName || 'Member', bounty));
                        } else {
                            console.warn(`⚠️ Could not decrypt email for user ${member.userID}`);
                        }
                    } catch (err) {
                        console.error(`❌ Error decrypting email for user ${member.userID}:`, err);
                    }
                } else {
                    console.warn(`⚠️ No email found for user ${member.userID}`);
                }
            }
            
            if (notifications.length === 0) {
                console.warn("⚠️ No notifications were queued. This usually means there are no OTHER active members besides the creator.");
            } else {
                await Promise.all(notifications);
                console.log(`✅ Successfully sent ${notifications.length} notifications.`);
            }
        } catch (error) {
            console.error("❌ Error sending new bounty notifications:", error);
        }

        return createdBounty;
    }

    static async getAllBounties(status) {
        const filter = {
            ...(status ? { status } : {}),
            $or: [
                { startsAt: { $exists: false } },
                { startsAt: { $lte: new Date() } }
            ]
        };
        const bounties = await BountyModel.getAllBounties(filter);

        // Enrich with usernames
        const allUsers = await UserModel.getAllUsers();
        const userMap = {};
        allUsers.forEach(u => {
            userMap[u.userID] = u.username || u.firstName || "Unknown";
        });

        return bounties.map(b => ({
            ...b,
            assignedToUsername: userMap[b.assignedTo] || b.assignedTo,
            creatorUsername: userMap[b.creatorID] || b.creatorID
        }));
    }

    static async getBountyById(bountyID) {
        return await BountyModel.getBountyById(bountyID);
    }

    static async assignBounty(bountyID, userID) {
        const bounty = await BountyModel.getBountyById(bountyID);
        if (!bounty) throw new Error("Bounty not found");
        if (bounty.status !== 'open') throw new Error("Bounty is not open");

        const result = await BountyModel.updateBounty(bountyID, {
            status: 'assigned',
            assignedTo: userID,
            assignedAt: new Date()
        });

        // Fetch users for notifications
        const assignee = await UserModel.getUserByQuery({ userID: userID });
        const creator = bounty.creatorID ? await UserModel.getUserByQuery({ userID: bounty.creatorID }) : null;

        // 1. Notify Assignee (In-App)
        await NotificationService.create({
            userID: userID,
            type: 'success',
            title: 'Bounty Claimed',
            message: `You have successfully claimed the bounty: ${bounty.title}`,
            link: `/dashboard/bounties?highlight=${bountyID}`,
            metadata: { bountyID }
        });

        // 2. Notify Creator (In-App & Email)
        if (creator && creator.userID !== userID) {
            // In-App
            await NotificationService.create({
                userID: creator.userID,
                type: 'info',
                title: 'Bounty Claimed',
                message: `${assignee ? assignee.firstName : 'A user'} has claimed your bounty: ${bounty.title}`,
                link: `/dashboard/bounties?highlight=${bountyID}`,
                metadata: { bountyID, claimerID: userID }
            });

            // Email
            if (creator.email) {
                try {
                    const decryptedEmail = AuthService.decryptEmail(creator.email);
                    if (decryptedEmail) {
                        await sendBountyClaimedEmail(
                            decryptedEmail, 
                            creator.firstName || 'Member', 
                            bounty, 
                            assignee ? `${assignee.firstName} ${assignee.lastName}` : 'A member'
                        );
                    }
                } catch (err) {
                    console.error(`❌ Error sending bounty claimed email to creator ${creator.userID}:`, err);
                }
            }
        }

        return result;
    }

    static async submitBounty(bountyID, userID, submissionData) {
        const bounty = await BountyModel.getBountyById(bountyID);
        if (!bounty) throw new Error("Bounty not found");
        
        // Allow submission if assigned OR if it's open (first come first serve logic could apply, but let's stick to assigned or open)
        // If it's assigned, only the assignee can submit
        if (bounty.status === 'assigned' && bounty.assignedTo !== userID) {
            throw new Error("This bounty is assigned to someone else.");
        }

        const result = await BountyModel.updateBounty(bountyID, {
            status: 'completed', // Pending verification
            submissions: [...(bounty.submissions || []), { userID, ...submissionData, date: new Date() }]
        });

        // Notify Creator
        if (bounty.creatorID && bounty.creatorID !== userID) {
            // Fetch users
            const submitter = await UserModel.getUserByQuery({ userID: userID });
            const creator = await UserModel.getUserByQuery({ userID: bounty.creatorID });

            // In-App
            await NotificationService.create({
                userID: bounty.creatorID,
                type: 'info',
                title: 'Bounty Submitted',
                message: `Work has been submitted for your bounty: ${bounty.title}`,
                link: `/dashboard/bounties?highlight=${bountyID}`,
                metadata: { bountyID, submitterID: userID }
            });

            // Email
            if (creator && creator.email) {
                try {
                    const decryptedEmail = AuthService.decryptEmail(creator.email);
                    if (decryptedEmail) {
                        await sendBountySubmittedEmail(
                            decryptedEmail,
                            creator.firstName || 'Member',
                            bounty,
                            submitter ? `${submitter.firstName} ${submitter.lastName}` : 'A member'
                        );
                    }
                } catch (err) {
                    console.error(`❌ Error sending bounty submitted email to creator ${creator.userID}:`, err);
                }
            }
        }

        return result;
    }

    static async verifyBounty(bountyID, verifierID) {
        const bounty = await BountyModel.getBountyById(bountyID);
        if (!bounty) throw new Error("Bounty not found");
        if (bounty.status !== 'completed') throw new Error("Bounty is not pending verification");

        // 1. Update Bounty Status
        await BountyModel.updateBounty(bountyID, {
            status: 'verified',
            completedAt: new Date()
        });

        // 2. Award Stake and Rewards
        const assigneeID = bounty.assignedTo || (bounty.submissions.length > 0 ? bounty.submissions[0].userID : null);
        
        if (assigneeID) {
            const user = await UserModel.getUserByQuery({ userID: assigneeID });
            if (user) {
                const updates = {
                    stake: (user.stake || 0) + (bounty.stakeValue || 0)
                };

                // If reward is volunteer hours, log them
                if (bounty.rewardType === 'hours') {
                    const newLog = {
                        id: uuidv4(),
                        date: new Date().toISOString(),
                        hours: Number(bounty.rewardValue),
                        description: `Bounty Completed: ${bounty.title}`,
                        status: 'approved',
                        verifiedBy: verifierID
                    };
                    updates.membership = {
                        ...user.membership,
                        volunteerLog: [newLog, ...(user.membership.volunteerLog || [])]
                    };
                }

                await UserModel.updateUser({ userID: assigneeID }, updates);

                // Notify Assignee
                await NotificationService.create({
                    userID: assigneeID,
                    type: 'success',
                    title: 'Bounty Verified!',
                    message: `Your work on "${bounty.title}" has been verified. You received ${bounty.stakeValue} Stake and ${bounty.rewardValue} ${bounty.rewardType === 'hours' ? 'Hours' : ''}.`,
                    link: `/dashboard/bounties?highlight=${bountyID}`,
                    metadata: { bountyID }
                });

                // Email Assignee
                if (user.email) {
                    try {
                        const decryptedEmail = AuthService.decryptEmail(user.email);
                        if (decryptedEmail) {
                            await sendBountyVerifiedEmail(
                                decryptedEmail,
                                user.firstName || 'Member',
                                bounty
                            );
                        }
                    } catch (err) {
                        console.error(`❌ Error sending bounty verified email to assignee ${assigneeID}:`, err);
                    }
                }
            }
        }

        // Spawn next recurring bounty if applicable
        if (bounty.recurrence && bounty.recurrence !== 'none') {
            await this.spawnNextRecurringBounty(bounty);
        }

        return true;
    }

    static async spawnNextRecurringBounty(originalBounty) {
        let nextDate = new Date();
        
        if (originalBounty.recurrence === 'daily') {
            nextDate.setDate(nextDate.getDate() + 1);
            nextDate.setHours(0, 0, 0, 0);
        } else if (originalBounty.recurrence === 'weekly') {
            nextDate.setDate(nextDate.getDate() + 7);
            nextDate.setHours(0, 0, 0, 0);
        } else if (originalBounty.recurrence === 'monthly') {
            nextDate.setMonth(nextDate.getMonth() + 1);
            nextDate.setDate(1); 
            nextDate.setHours(0, 0, 0, 0);
        }

        const newBountyData = {
            title: originalBounty.title,
            description: originalBounty.description,
            creatorID: originalBounty.creatorID,
            rewardType: originalBounty.rewardType,
            rewardValue: originalBounty.rewardValue,
            stakeValue: Math.max(0, (originalBounty.stakeValue || 0) - 3), // Pass only additional stake
            requirements: originalBounty.requirements,
            recurrence: originalBounty.recurrence,
            startsAt: nextDate
        };

        await this.createBounty(newBountyData);
    }

    static async cancelBounty(bountyID, userID) {
        const bounty = await BountyModel.getBountyById(bountyID);
        if (!bounty) throw new Error("Bounty not found");
        
        // Check if user is creator OR admin
        const user = await UserModel.getUserByQuery({ userID });
        const isAdmin = user?.role === 'admin';
        
        if (bounty.creatorID !== userID && !isAdmin) {
            throw new Error("Only the creator or an admin can cancel this bounty");
        }

        return await BountyModel.updateBounty(bountyID, { status: 'cancelled' });
    }

    static async editBounty(bountyID, userID, updateData) {
        const bounty = await BountyModel.getBountyById(bountyID);
        if (!bounty) throw new Error("Bounty not found");

        // Check permissions
        const user = await UserModel.getUserByQuery({ userID });
        const isAdmin = user?.role === 'admin';

        if (bounty.creatorID !== userID && !isAdmin) {
            throw new Error("Only the creator or an admin can edit this bounty");
        }

        // Prevent editing if already completed/verified
        if (['completed', 'verified'].includes(bounty.status)) {
            throw new Error("Cannot edit a completed bounty");
        }

        return await BountyModel.updateBounty(bountyID, updateData);
    }

    static async clawbackBounty(bountyID, userID) {
        const bounty = await BountyModel.getBountyById(bountyID);
        if (!bounty) throw new Error("Bounty not found");

        // Check permissions
        const user = await UserModel.getUserByQuery({ userID });
        const isAdmin = user?.role === 'admin';

        if (bounty.creatorID !== userID && !isAdmin) {
            throw new Error("Only the creator or an admin can clawback this bounty");
        }

        if (bounty.status !== 'assigned') {
            throw new Error("Bounty is not currently assigned");
        }

        return await BountyModel.updateBounty(bountyID, {
            status: 'open',
            assignedTo: null,
            assignedAt: null
        });
    }
}
