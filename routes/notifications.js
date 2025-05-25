import { Router } from 'express';
import { sendNotification } from '../notifications/sendNotifications.js';

export const notificationRouter = Router();

// Replace this with actual stored device tokens
const testTokens = [
    process.env.TEST_DEVICE_ID
];

notificationRouter.post('/send-test', (req, res) => {
  sendNotification(testTokens);
  res.status(200).json({ message: 'Test notification sent.' });
});

