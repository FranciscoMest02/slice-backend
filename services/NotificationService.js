import apn from 'apn';
import { apnProvider } from "../drivers/apnsNotifications.js";

export class NotificationService {
    static async sendFriendRequestNotification({ to, from }) {
        const notification = new apn.Notification({
            alert: {
                title: "Let's tie some knots!",
                body: `${from} sent you a friend request`,
            },
            topic: 'com.panchito.Slice',
        });
        // notification.sound = 'mannagg.caf'
        notification.payload = {
            type: "FRIEND_REQUEST"
        }

        try {
            let response = await apnProvider.send(notification, to);
            console.log('APNs response:', response);
        } catch (err) {
            console.error('APNs send error:', err);
        }
    }

    static async sendAcceptedFriendRequestNotification({ to, from }) {
        const notification = new apn.Notification({
            alert: {
                title: "Beautiful knot!",
                body: `${from} accepted your friend request`,
            },
            topic: 'com.panchito.Slice',
        });
        // notification.sound = 'mannagg.caf'
        notification.payload = {
            type: "FRIEND_REQUEST_ACCEPTED"
        }

        try {
            let response = await apnProvider.send(notification, to);
            console.log('APNs response:', response);
        } catch (err) {
            console.error('APNs send error:', err);
        }
    }
}