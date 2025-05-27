import express from 'express'
import morgan from 'morgan';
import { usersRouter } from './routes/users.js';
import { friendsRouter } from './routes/friends.js';
//require('dotenv').config();

const app = express();
app.set('trust proxy', true);
app.disable('x-powered-by');

//Log the https requests
app.use(morgan('dev'));

app.use(express.json());
// app.use('/pairings', pairingRoutes);
app.use('/user', usersRouter);
app.use('/friends', friendsRouter)

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});