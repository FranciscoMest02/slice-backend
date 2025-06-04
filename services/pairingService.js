import driver from "../drivers/neo4j.js";
import todayString from "../utils/date.js";

export async function createPairs() {
    const session = driver.session();
    const today = todayString();

    try {
    const checkResult = await session.run(`
        MATCH ()-[r:PAIRED_WITH {date: $today}]-()
        RETURN count(r) > 0 AS exists
    `, { today });

    const alreadyPaired = checkResult.records[0].get('exists');
    if (!alreadyPaired) {
        const result = await session.run(`
        // 1) Collect every undirected friend pair exactly once
        MATCH (u:User)-[:FRIENDS_WITH]-(f:User)
        WHERE id(u) < id(f)
        WITH collect([u, f]) AS rawPairs
    
        // 2) Shuffle them randomly (requires APOC)
        WITH apoc.coll.shuffle(rawPairs) AS pairs
    
        // 3) Greedily build up matches, tracking “used” users
        WITH reduce(
            state = { used: [], matches: [] },
            pair IN pairs |
                CASE
                // If neither node is in used[], accept this pair
                WHEN NOT pair[0] IN state.used AND NOT pair[1] IN state.used THEN
                    {
                    used:   state.used   + [pair[0], pair[1]],
                    matches: state.matches + [pair]
                    }
                // Otherwise skip it
                ELSE state
                END
            ) AS result
    
        // 4) Unwind the final list of matches and return names
        UNWIND result.matches AS pair
        RETURN
            pair[0].id AS user1,
            pair[1].id AS user2;
    
        `, { today });
    
        let pairs = result.records.map(record => ({
        user1: record.get('user1'),
        user2: record.get('user2')
        }));

        for (const pair of pairs) {
        const prompt = promptsArray[Math.floor(Math.random() * promptsArray.length)]

        const goesFirst = Math.random() < 0.5; //Boolean to decide which user goes first
        const isFirstSide = Math.random() < 0.5; //Boolean to decide which side of the pairing is user1
        
        const pairArray = [pair.user1, pair.user2]; 

        const firstUserId = pairArray[goesFirst ? 0 : 1]; 
        const userForSide0 = pairArray[isFirstSide ? 0 : 1];

        await session.run(`
            MATCH (a:User {id: $user1}), (b:User {id: $user2})
            CREATE (a)-[:PAIRED_WITH {date: $today, notificationSent: false, promptId: $promptId, firstUserId: $firstUserId , userForSide0: $userForSide0 }]->(b)
        `, {
            user1: pair.user1,
            user2: pair.user2,
            today,
            promptId: prompt.id,
            firstUserId,
            userForSide0
        });
        }
    }

    const createdPairs = await session.run(`
        MATCH (a:User)-[r:PAIRED_WITH {date: $today}]-(b:User)
        WHERE id(a) < id(b) // avoid duplicates
        RETURN a.name AS user1, b.name AS user2
        `, { today });

    return createdPairs.records.map(record => ({
        user1: record.get('user1'),
        user2: record.get('user2')
    }));

    } finally {
    await session.close();
    }
}

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