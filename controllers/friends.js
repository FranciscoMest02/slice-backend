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

    static async removeFriend(req, res) {
        const { userId, friendId } = req.body;

        if (!userId || !friendId) {
            return res.status(400).send('User ID and Friend ID are required');
        }

        try {
            const result = await FriendsModel.removeFriend(userId.toLowerCase(), friendId.toLowerCase());
            res.status(200).json({ result });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error removing user');
        }
    }

    static async blockUser(req, res) {
        const { userId, blockedUserId } = req.body;

        if (!userId || !blockedUserId) {
            return res.status(400).send('User ID and Blocked User ID are required');
        }

        try {
            const result = await FriendsModel.blockUser(userId.toLowerCase(), blockedUserId.toLowerCase());
            res.status(200).json({ result });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error blocking user');
        }
    }
    
    static async unblockUser(req, res) {
        const { userId, blockedUserId } = req.body;

        if (!userId || !blockedUserId) {
            return res.status(400).send('User ID and Blocked User ID are required');
        }

        try {
            const result = await FriendsModel.unblockUser(userId.toLowerCase(), blockedUserId.toLowerCase());
            res.status(200).json({ result });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error unblocking user');
        }
    }
}