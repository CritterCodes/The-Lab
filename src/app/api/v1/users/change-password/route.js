import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import UserModel from '../model';

export async function POST(req) {
    try {
        const { userID, currentPassword, newPassword } = await req.json();

        if (!userID || !currentPassword || !newPassword) {
            return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
        }

        // 1. Fetch the user
        const user = await UserModel.getUserByQuery({ userID });
        if (!user) {
            return NextResponse.json({ error: "User not found." }, { status: 404 });
        }

        // 2. Verify current password
        // Note: If the user has "no password" (e.g. OAuth only), this check might fail or need special handling.
        // Assuming standard flow where they set a password or we force them to set one via reset flow if they don't have one.
        // For now, we'll assume they must provide a valid current password.
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return NextResponse.json({ error: "Incorrect current password." }, { status: 401 });
        }

        // 3. Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 4. Update user
        const updatedUser = await UserModel.updateUser(userID, { password: hashedPassword });

        if (!updatedUser) {
            return NextResponse.json({ error: "Failed to update password." }, { status: 500 });
        }

        return NextResponse.json({ message: "Password updated successfully." }, { status: 200 });

    } catch (error) {
        console.error("Error changing password:", error);
        return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}
