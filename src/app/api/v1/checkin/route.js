import { NextResponse } from 'next/server';
import { auth } from "../../../../../auth";
import UserModel from "../users/model";
import DiscordService from "@/lib/discord";
import Constants from "@/lib/constants";

export const runtime = "nodejs";

export async function GET(req) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await UserModel.getUserByQuery({ userID: session.user.userID });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ 
            isCheckedIn: !!user.isCheckedIn,
            lastCheckIn: user.lastCheckIn
        });
    } catch (error) {
        console.error("Check-in status error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { action } = await req.json(); // 'checkin' or 'checkout'
        const user = await UserModel.getUserByQuery({ userID: session.user.userID });
        
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const isCheckingIn = action === 'checkin';
        const updates = {
            isCheckedIn: isCheckingIn,
            lastCheckIn: isCheckingIn ? new Date() : user.lastCheckIn,
            lastCheckOut: isCheckingIn ? user.lastCheckOut : new Date()
        };

        // Update DB
        await UserModel.updateUser({ userID: user.userID }, updates);

        // Update Discord Role
        if (user.discordId) {
            console.log(`🔄 Attempting to update Discord role for user ${user.username} (${user.discordId})`);
            
            // Debug: Check if member exists in guild
            const member = await DiscordService.getMember(user.discordId);
            if (!member) {
                console.error(`❌ Discord Member ${user.discordId} NOT FOUND in guild.`);
            } else {
                console.log(`✅ Found Discord Member: ${member.user.username} (Roles: ${member.roles.length})`);
            }

            let discordResult;
            if (isCheckingIn) {
                discordResult = await DiscordService.addRole(user.discordId, Constants.CHECKED_IN_ROLE_ID);
            } else {
                discordResult = await DiscordService.removeRole(user.discordId, Constants.CHECKED_IN_ROLE_ID);
            }
            
            if (discordResult) {
                console.log(`✅ Discord role ${isCheckingIn ? 'added' : 'removed'} successfully.`);
            } else {
                console.error(`❌ Failed to update Discord role. Check DiscordService logs.`);
            }
        } else {
            console.warn(`⚠️ User ${user.username} has no Discord ID linked. Skipping role update.`);
        }

        return NextResponse.json({ 
            success: true, 
            isCheckedIn: isCheckingIn,
            message: isCheckingIn ? "Checked in successfully" : "Checked out successfully",
            discordUpdated: !!user.discordId
        });

    } catch (error) {
        console.error("Check-in action error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
