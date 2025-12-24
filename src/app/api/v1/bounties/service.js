import Bounty from "./class";
import BountyModel from "./model";
import UserModel from "../users/model";

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
        return await BountyModel.createBounty(bounty);
    }

    static async getAllBounties(status) {
        const filter = {
            ...(status ? { status } : {}),
            $or: [
                { startsAt: { $exists: false } },
                { startsAt: { $lte: new Date() } }
            ]
        };
        return await BountyModel.getAllBounties(filter);
    }

    static async getBountyById(bountyID) {
        return await BountyModel.getBountyById(bountyID);
    }

    static async assignBounty(bountyID, userID) {
        const bounty = await BountyModel.getBountyById(bountyID);
        if (!bounty) throw new Error("Bounty not found");
        if (bounty.status !== 'open') throw new Error("Bounty is not open");

        return await BountyModel.updateBounty(bountyID, {
            status: 'assigned',
            assignedTo: userID,
            assignedAt: new Date()
        });
    }

    static async submitBounty(bountyID, userID, submissionData) {
        const bounty = await BountyModel.getBountyById(bountyID);
        if (!bounty) throw new Error("Bounty not found");
        
        // Allow submission if assigned OR if it's open (first come first serve logic could apply, but let's stick to assigned or open)
        // If it's assigned, only the assignee can submit
        if (bounty.status === 'assigned' && bounty.assignedTo !== userID) {
            throw new Error("This bounty is assigned to someone else.");
        }

        return await BountyModel.updateBounty(bountyID, {
            status: 'completed', // Pending verification
            submissions: [...(bounty.submissions || []), { userID, ...submissionData, date: new Date() }]
        });
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
                        id: crypto.randomUUID(),
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
        if (bounty.creatorID !== userID) throw new Error("Only the creator can cancel this bounty");

        return await BountyModel.updateBounty(bountyID, { status: 'cancelled' });
    }
}
