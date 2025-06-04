import driver from "../drivers/neo4j.js";

export async function markPairNotified(pairId) {
  const session = driver.session();
  const query = `
    MATCH ()-[r:PAIRED_WITH]->()
    WHERE id(r) = $pairId
    SET r.notificationSent = true
    RETURN id(r) AS updatedId
  `;

  try {
    const result = await session.run(query, { pairId });

    if (result.records.length === 0) {
      console.warn(`⚠️ No relationship found for ID ${pairId}`);
    } else {
      console.log(`✅ Updated notificationSent on relationship ID ${pairId}`);
    }
  } catch (err) {
    console.error("❌ Failed to update notificationSent:", err);
  } finally {
    await session.close();
  }
}