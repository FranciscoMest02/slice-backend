
import { Router } from 'express';
import neo4j from 'neo4j-driver';

export const registerDeviceRouter = Router();

const driver = neo4j.driver(
  'bolt://localhost:7687',
  neo4j.auth.basic('neo4j', 'your-password')
);

registerDeviceRouter.post('/register-device', async (req, res) => {
  const { userId, deviceToken } = req.body;

  if (!userId || !deviceToken) {
    return res.status(400).json({ error: 'Missing userId or deviceToken' });
  }

  const session = driver.session();

  try {
    await session.run(
      `
      MERGE (u:User {id: $userId})
      SET u.deviceToken = $deviceToken
      `,
      { userId, deviceToken }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Neo4j error:", error);
    res.status(500).json({ error: 'Database error' });
  } finally {
    await session.close();
  }
});


