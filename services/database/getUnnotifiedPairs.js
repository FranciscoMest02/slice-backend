import driver from "../drivers/neo4j.js";

export async function getUnnotifiedPairs() {
  const session = driver.session();
  const query = `
    MATCH (a:User)-[r:PAIRED_WITH {notificationSent: false}]->(b:User)
    RETURN id(r) AS pairId, a {.*, id: a.id } AS userA, b {.*, id: b.id } AS userB
  `;

  try {
    const result = await session.run(query);
    return result.records.map(record => ({
      id: record.get('pairId'),
      userA: record.get('userA'),
      userB: record.get('userB')
    }));
  } finally {
    await session.close();
  }
}