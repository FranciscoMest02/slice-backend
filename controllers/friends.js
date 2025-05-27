import { FriendsModel } from "../models/friends.js";

export class FriendsController {
    static async requestFriendship(req, res) {
        const { userId, friendId } = req.body;

        if (!userId || !friendId) {
            return res.status(400).send('User ID and Friend ID are required');
        }

        try {
            const result = await FriendsModel.requestFriendship(userId, friendId);
            res.status(200).json({ result });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error requesting friendship');
        }
    }

    static async getFriendRequests(req, res) {
        const userId = req.params.id;

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
        const { userId, friendId } = req.body;

        if (!userId || !friendId) {
            return res.status(400).send('User ID and Friend ID are required');
        }

        try {
            const result = await FriendsModel.acceptFriendRequest(userId, friendId);
            res.status(200).send({ result });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error accepting friend request');
        }
    }
}