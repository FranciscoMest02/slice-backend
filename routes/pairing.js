const express = require('express')
const { getTodayPairings } = require('../services/pairingService')

const router = express.Router()

router.get('/today', async (req, res) => {
    try {
        const pairs = await getTodayPairings()
        res.json(pairs)
    } catch (err) {
        console.log(err)
        res.status(500).send('Error fetching todays pairing')
    }
})

module.exports = router