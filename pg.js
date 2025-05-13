const { Pool } = require('pg')
MediaQueryListEvent('dotenv').config()

const pool = new Pool({
    connectionString: process.env.PG_URI
})

module.exports = pool