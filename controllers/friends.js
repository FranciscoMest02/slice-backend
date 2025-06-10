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

    static async getUserInfoForFriendRequest(req, res) {
        const friendId = req.params?.id?.toLowerCase();
        const userId = req.body?.from?.toLowerCase();

        if (!userId) {
            return res.status(400).json({
                status: "error",
                error: {
                    code: 400,
                    message: "User ID is required"
                }
            });
        }

        if (!friendId) {
            return res.status(400).json({
                status: "error",
                error: {
                    code: 400,
                    message: "Friend ID is required"
                }
            });
        }

        try {
            const user = await UsersModel.getUser(userId);
        
            if (!user || !user.user) {
                return res.status(404).json({
                    status: "error",
                    error: {
                        code: 404,
                        message: "User not found"
                    }
                });
            }

            const friend = await UsersModel.getUser(friendId);
        
            if (!friend || !friend.user) {
                return res.status(404).json({
                    status: "error",
                    error: {
                        code: 404,
                        message: "Friend not found"
                    }
                });
            }

            const isBlocked = await FriendsModel.isBlocked(userId, friendId);
            
            if (isBlocked) {
                return res.status(200).json({
                    status: "success",
                    data: {
                        user: friend.user,
                        friendRequestStatus: "blocked"
                    }
                });
            }

            let friendRequestStatus = "can_send";

            const requestFromFriend = await FriendsModel.friendRequestExists(userId, friendId);
            const requestToFriend = await FriendsModel.friendRequestExists(friendId, userId);
            const areAlreadyFriends = await FriendsModel.areFriends(userId, friendId);

            if (areAlreadyFriends) {
                friendRequestStatus = "already_friends";
            } else if (requestFromFriend) {
                friendRequestStatus = "already_received";
            } else if (requestToFriend) {
                friendRequestStatus = "already_sent";
            }

            return res.status(200).json({
                status: "success",
                data: {
                    user: friend.user,
                    friendRequestStatus
                }
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({
                status: "error",
                error: {
                    code: 500,
                    message: "Internal server error"
                }
            });
        }
    }
}