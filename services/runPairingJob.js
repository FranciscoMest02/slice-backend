// services/pairingService.js
import { createPairs } from './pairingService.js';
import { sendPairNotifications } from './notifications.js';

export async function runPairingJob() {
  console.log("🔄 Starting pairing job...");
  await createPairs();
  console.log("Pairs created successfully, now sending notifications...");
  await sendPairNotifications()
  console.log("✅ Pairing job completed.");
}