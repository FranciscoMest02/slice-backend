import { UsersModel } from "../models/users.js";
import { v4 as uuidv4 } from 'uuid';

export class UserController {
    static async create (req, res) {
        if (!req.body) {
            return res.status(400).send('Body required');
        }
        
        const { username } = req.body;
    
        if (!username) {
            return res.status(400).send('Username is required');
        }

        // Validate if the username is available
        const existingUser = await UsersModel.getFromUsername(username);
        if (existingUser) {
            return res.status(409).json({ message: 'Username already taken' });
        }
    
        try {
            const id = uuidv4(); // Generate UUID
            const result = await UsersModel.createUser(id, username);
            res.status(201).json({ message: 'User created successfully', result });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error creating user');
        }
    }

    static async connect (req, res) {
        if (!req.body) {
            return res.status(400).send('Body required');
        }
    
        const { from: user1, to: user2 } = req.body
    
        if(!user1 || !user2) {
            return res.status(400).send('Two user ids must be given to make the friendship connection')
        }
    
        try {
            const result = await UsersModel.createFriendship(user1, user2);
            res.status(201).json({ message: 'Friendship created successfully', result });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error creating friendship');
        }
    }

    static async todaysPairings (req, res) {
        try {
            const result = await UsersModel.todaysPairing();
            res.status(200).json({ result })
        } catch(err) {
            console.log(err)
            res.status(500).send('Error fetching todays pairing')
        }
    }

    static async getUser (req, res) {
        const id = req.params.id.toLowerCase();
    
        if (!id) {
            return res.status(400).send('User ID is required');
        }
    
        try {
            const result = await UsersModel.getUser(id);
            res.status(200).json({ result });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error fetching user');
        }
    }

    static async updateUser (req, res) {
        const id = req.params.id.toLowerCase();
    
        if (!id) {
            return res.status(400).send('User ID is required');
        }

        const immutableFields = ['id', 'created_at'];

        const updates = { ...req.body };

        for (const field of immutableFields) {
            if (updates.hasOwnProperty(field)) {
                return res.status(400).json({ error: `Field '${field}' cannot be modified.` });
            }
        }
    
        try {
            const existingUser = await UsersModel.getUser(id);
            if (!existingUser) {
                return res.status(404).send('User not found');
            }

            const updatedUser = await UsersModel.updateUser(id, updates);

            return res.status(200).json({ user: updatedUser });
        } catch (err) {
            console.error('Update error:', err);
            return res.status(500).send('Error updating user');
        }
    }

    static async getFriends (req, res) {
        const id = req.params.id.toLowerCase();
    
        if (!id) {
            return res.status(400).send('User ID is required');
        }
    
        try {
            const result = await UsersModel.getFriends(id);
            res.status(200).json({ result });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error fetching friends');
        }
    }

    static async getUserPairing (req, res) {
        const id = req.params.id.toLowerCase();
    
        if (!id) {
            return res.status(400).send('User ID is required');
        }
    
        try {
            const result = await UsersModel.getUserPairing(id);
            res.status(200).json({ result });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error fetching user pair');
        }
    }
}