import apn from 'apn';

const deviceToken = '0845f950d17836ee223d6b4d688ae7a5cd7776232fddc1fd07e2c4e4dfe5dbd4';

export const apnProvider = new apn.Provider({
  token: {
    key: './AuthKey_25TKY45DH6.p8',
    keyId: '25TKY45DH6',
    teamId: '8H6UM9PBYV'
  },
  production: false
});
/*
export const apnProvider = new apn.Provider({
  token: {
    key: './AuthKey_5DFKPC9LKR.p8',
    keyId: '5DFKPC9LKR',
    teamId: '8H6UM9PBYV'
  },
  production: true
});
*/
// Build the notification
const notification = new apn.Notification({
  alert: {
    title: "Ready to knot!",
    body: "Jump in and discover your new pair!"
  },
  topic: "com.panchito.Slice"
});

// Send it
async function sendMockNotification() {
  try {
    const result = await apnProvider.send(notification, deviceToken);
    console.log("APNs response:", JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("Error sending notification:", err);
  } finally {
    apnProvider.shutdown();
  }
}

sendMockNotification();