const driver = require('../neo4j');
const { todayString } = require('../utils/date');

async function getTodayPairings() {
  const session = driver.session();
  const today = todayString();

  try {
    const result = await session.run(`
      // 1. Get users with their total pairing count
        MATCH (u:User)
        OPTIONAL MATCH (u)-[r:PAIRED_WITH]->()
        WITH u, count(r) AS pairCount
        WITH u, 1.0 / (1 + pairCount) AS weight

        // 2. Collect weighted users
        WITH collect({user: u, weight: weight}) AS weightedUsers

        // 3. Generate candidate friend pairs
        UNWIND weightedUsers AS u1
        UNWIND weightedUsers AS u2

        WITH u1.user AS user1, u1.weight AS weight1,
            u2.user AS user2, u2.weight AS weight2

        WHERE user1.id < user2.id
        AND (user1)-[:FRIEND_WITH]-(user2)
        AND NOT (user1)-[:PAIRED_WITH {date: date()}]-(user2)

        WITH user1, user2, (weight1 + weight2) AS pairWeight, rand() AS r
        ORDER BY pairWeight DESC, r
        WITH collect({u1: user1, u2: user2}) AS pairs

        WITH apoc.coll.pairsMin(pairs) AS selected
        UNWIND selected AS pair
        WITH pair.u1 AS u1, pair.u2 AS u2
        MERGE (u1)-[:PAIRED_WITH {date: date()}]-(u2)
        ON CREATE SET r.count = 1
        ON MATCH SET r.count = r.count + 1
        RETURN u1.id AS user1Id, u2.id AS user2Id, r.count

    `, { today });

    return result.records.map(record => ({
      user1: record.get('user1'),
      user2: record.get('user2')
    }));
  } finally {
    await session.close();
  }
}

module.exports = { getTodayPairings };