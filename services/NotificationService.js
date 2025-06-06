import { apnProvider } from "../drivers/apnsNotifications.js";

export class NotificationService {
    static async sendFriendRequestNotification({ to, from }) {
        const notification = new apn.Notification({
            alert: `${from} sent you a friend request!`,
            sound: 'default',
            topic: 'com.panchito.Slice',
        });

        try {
            let response = await apnProvider.send(notification, to);
            console.log('APNs response:', response);
        } catch (err) {
            console.error('APNs send error:', err);
        }
    }
}