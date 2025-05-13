const express = require('express')
const { createUser } = require('../services/createUser')
const { createFriendship } = require('../services/createFriendship')

const router = express.Router()

router.post('/create', async (req, res) => {
    if (!req.body) {
        return res.status(400).send('Body required');
    }
    
    const { id, name } = req.body;

    if (!id || !name) {
        return res.status(400).send('ID and name are required');
    }

    try {
        const result = await createUser(id, name);
        res.status(201).json({ message: 'User created successfully', result });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating user');
    }
})

router.post('/connect', async (req, res) => {
    if (!req.body) {
        return res.status(400).send('Body required');
    }

    const { from: user1, to: user2 } = req.body

    if(!user1 || !user2) {
        return res.status(400).send('Two user ids must be given to make the friendship connection')
    }

    try {
        const result = await createFriendship(user1, user2);
        res.status(201).json({ message: 'Friendship created successfully', result });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating friendship');
    }
})

module.exports = router