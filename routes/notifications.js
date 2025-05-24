import express from 'express';
import { sendNotification } from '../notifications/sendNotifications.js';

export const notificationRouter = express.Router();

// Replace this with actual stored device tokens
const testTokens = [
  "e42631a103c8e7c4fe61b4715821260d761b112127afa49553a23ef420696fab"
];

notificationRouter.post('/send-test', (req, res) => {
  sendNotification(testTokens);
  res.status(200).json({ message: 'Test notification sent.' });
});

