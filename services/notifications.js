import apn from 'apn';

import { getUnnotifiedPairs, markPairNotified } from './pairingService.js';

const apnProvider = new apn.Provider({
  token: {
    key: process.env.APNS_KEY_PATH,
    keyId: process.env.APNS_KEY_ID,
    teamId: process.env.APNS_TEAM_ID
  },
  production: process.env.APNS_PRODUCTION === 'true'
});

export async function sendPairNotifications() {
  const pairs = await getUnnotifiedPairs(); // fetch pairs with notificationSent = false
  
  for (const pair of pairs) {
    console.log(`Sending notifications for pair ${pair.userA.name} and ${pair.userB.name}...`);
    for (const user of [pair.userA, pair.userB]) {
      if (user.deviceToken) {
        const notification = new apn.Notification({
            
          alert: {
            title: "Ready to knot!",
            body: "Jump in and discover your new pair!"
          },
          topic: process.env.APNS_BUNDLE_ID
        });

        try {
          await apnProvider.send(notification, user.deviceToken);
          console.log(`Notification sent to user ${user.id}`);
        } catch (err) {
          console.error(`Error sending to user ${user.id}:`, err);
        }
      }
    }

    await markPairNotified(pair.id); // update notificationSent to true
  }
}