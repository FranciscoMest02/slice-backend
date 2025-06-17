import apn from 'apn';
import { apnProvider } from "../drivers/apnsNotifications.js";

export class NotificationService {
    static async sendFriendRequestNotification({ to, from }) {
        const notification = new apn.Notification({
            alert: {
                title: "let's tie some knots!",
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
                title: "a beautiful knot!",
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

    static async sendKnotUpdateNotification({ deviceToken, title, description }) {
        if(!deviceToken) {
            console.error('Device token is required for sending knot update notification');
            return;
        }
        /*
        let alert = ""

        if(description || title) {
            alert = {
                title: title || "New updates!",
                body: description || "Your friend has updated their knot",
            };
        }
        */

        const notification = new apn.Notification({
            alert: {
                title: title || "new updates!",
                body: description || "your friend has updated their knot",
            },
            contentAvailable: 1, // Silent notification
            topic: 'com.panchito.Slice',
        });
        notification.payload = {
            type: "KNOT_UPDATE"
        };

        try {
            let response = await apnProvider.send(notification, deviceToken);
            console.log('APNs response:', response);
        } catch (err) {
            console.error('APNs send error:', err);
        }
    }
}