import cron from 'node-cron';
import { runPairingJob } from '../services/runPairingJob.js';

// Runs every day at 1:00 AM server time (9AM UTC - Italy time)
cron.schedule('53 9 * * *', async () => {
  console.log("⏰ Running scheduled pairing + notification job...");
  try {
    await runPairingJob();
    console.log("✅ Pairing job completed.");
  } catch (err) {
    console.error("❌ Cron job failed:", err);
  }
}, {
  timezone: "Europe/Rome"
});