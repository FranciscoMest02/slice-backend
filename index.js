import express from 'express'
import morgan from 'morgan';
import { usersRouter } from './routes/users.js';
//require('dotenv').config();

const app = express();
app.disable('x-powered-by');

//Log the https requests
app.use(morgan('dev'));

app.use(express.json());
// app.use('/pairings', pairingRoutes);
app.use('/user', usersRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});