import { apnProvider } from "../drivers/apnsNotifications.js";
import { FriendsModel } from "../models/friends.js";
import { UsersModel } from "../models/users.js";
import { NotificationService } from "../services/NotificationService.js";

export class FriendsController {
    static async requestFriendship(req, res) {
        let { userId, friendId } = req.body;

        if (!userId || !friendId) {
            return res.status(400).send('User ID and Friend ID are required');
        }

        userId = userId.toLowerCase();
        friendId = friendId.toLowerCase();

        try {
            const result = await FriendsModel.requestFriendship(userId, friendId);
            
            const receiver = result.receiver
            const pushToken = receiver?.deviceToken

            const senderName = result.sender.name

            if (pushToken) {
                NotificationService.sendFriendRequestNotification({ to: pushToken, from: senderName })
            }
            res.status(200).json({ result });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error requesting friendship');
        }
    }

    static async getFriendRequests(req, res) {
        const userId = req.params.id.toLowerCase();

        if (!userId) {
            return res.status(400).send('User ID is required');
        }

        try {
            const result = await FriendsModel.getFriendRequests(userId);
            res.status(200).json({ result });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error fetching friend requests');
        }
    }

    static async acceptFriendRequest(req, res) {
        let { userId, friendId } = req.body;

        if (!userId || !friendId) {
            return res.status(400).send('User ID and Friend ID are required');
        }

        userId = userId.toLowerCase();
        friendId = friendId.toLowerCase();

        try {
            const result = await FriendsModel.acceptFriendRequest(userId, friendId);
            
            const pushToken = result.friend?.deviceToken;
            const senderName = result.user?.name;

            if (pushToken) {
                NotificationService.sendAcceptedFriendRequestNotification({ to: pushToken, from: senderName })
            }

            res.status(200).send({ result });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error accepting friend request');
        }
    }
}