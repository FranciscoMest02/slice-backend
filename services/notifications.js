import apn from 'apn';

import { getUnnotifiedPairs, markPairNotified } from './pairingService.js';
import { apnProvider } from '../drivers/apnsNotifications.js';

export async function sendPairNotifications() {
  const pairs = await getUnnotifiedPairs(); // fetch pairs with notificationSent = false
  
  for (const pair of pairs) {
    console.log(`Sending notifications for pair ${pair.userA.name} and ${pair.userB.name}...`);
    for (const user of [pair.userA, pair.userB]) {
      if (user.deviceToken) {
        const notification = new apn.Notification({
            
          alert: {
            title: "ready to knot?",
            body: "click to discover your knotmate of the day!"
          },
          topic: process.env.APNS_BUNDLE_ID
        });

        try {
          const result = await apnProvider.send(notification, user.deviceToken);
          console.log("APNs response:", JSON.stringify(result, null, 2));
          console.log(`Notification sent to user ${user.id}`);
        } catch (err) {
          console.error(`Error sending to user ${user.id}:`, err);
        }
      }
    }

    await markPairNotified(pair.id); // update notificationSent to true
  }
}