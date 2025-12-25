import NotificationService from './service';
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const userID = searchParams.get('userID');

        if (!userID) {
            return NextResponse.json({ error: "UserID is required" }, { status: 400 });
        }

        const notifications = await NotificationService.getUserNotifications(userID);
        return NextResponse.json({ notifications }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        const notification = await NotificationService.create(body);
        return NextResponse.json({ notification }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const body = await req.json();
        const { action, notificationID, userID } = body;

        if (!userID) {
            return NextResponse.json({ error: "UserID is required" }, { status: 400 });
        }

        if (action === 'markRead' && notificationID) {
            await NotificationService.markRead(notificationID, userID);
            return NextResponse.json({ success: true }, { status: 200 });
        }

        if (action === 'markAllRead') {
            await NotificationService.markAllRead(userID);
            return NextResponse.json({ success: true }, { status: 200 });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
