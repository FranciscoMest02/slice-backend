import express from 'express'
import morgan from 'morgan';
import { usersRouter } from './routes/users.js';
import { friendsRouter } from './routes/friends.js';
import { imagesRouter } from './routes/s3Images.js';
import { v2Router } from './v2/version2Router.js';

if (process.env.ENABLE_CRON === 'true') {
  import('./jobs/pairingCron.js');
}

const app = express();
app.set('trust proxy', true);
app.disable('x-powered-by');

//Log the https requests
app.use(morgan('dev'));

app.use(express.json());

// app.use('/pairings', pairingRoutes);
// Unversioned routes (existing)
app.use('/user', usersRouter);
app.use('/friends', friendsRouter);
app.use('/images', imagesRouter);

// Versioned routes (v2)
app.use('/v2', v2Router);

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});