const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const pairingRoutes = require('./routes/pairing');
const userRoutes = require('./routes/users')

app.use(express.json());
app.use('/pairings', pairingRoutes);
app.use('/user', userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});