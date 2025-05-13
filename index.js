const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const pairingRoutes = require('./routes/pairing');

app.use(express.json());
app.use('/pairings', pairingRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});