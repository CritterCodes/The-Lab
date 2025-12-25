import NotificationModel from './model';
import Notification from './class';

export default class NotificationService {
    static async create(data) {
        const { userID, type, title, message, link, metadata } = data;
        if (!userID || !title || !message) {
            throw new Error("Missing required fields");
        }
        
        const notification = new Notification(userID, type, title, message, link, metadata);
        return await NotificationModel.createNotification(notification);
    }

    static async getUserNotifications(userID) {
        return await NotificationModel.getNotificationsByUser(userID);
    }

    static async markRead(notificationID, userID) {
        return await NotificationModel.markAsRead(notificationID, userID);
    }

    static async markAllRead(userID) {
        return await NotificationModel.markAllAsRead(userID);
    }
}
