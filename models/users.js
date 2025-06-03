import driver from "../drivers/neo4j.js";
import { promptsArray } from "../prompts.js";
import todayString from "../utils/date.js";

export class UsersModel {
    static async createUser (id, name) {
        const session = driver.session();
        try {
            const query = `
                CREATE (u:User {id: $id, name: $name, avatar: "profile1"})
                RETURN u
            `;
            const params = { id, name };
            const result = await session.run(query, params);
            return result.records[0].get('u').properties;
        } finally {
            await session.close();
        }
    }

    static async getFromUsername(username) {
      const session = driver.session()
      try {
        const query = `
          MATCH (user:User {name: $username})
          RETURN user
        `;
        const params = { username };
        const result = await session.run(query, params);
    
        if (result.records.length === 0) {
          return null;
        }
    
        const userNode = result.records[0].get('user');
        return { user: userNode.properties };
      } finally {
        await session.close();
      }
    }

    static async createFriendship (user1, user2) {
        const session = driver.session();
        try {
            const query = `
                MATCH (u1:User {id: $user1}), (u2:User {id: $user2})
                MERGE (u1)-[:FRIENDS_WITH]->(u2)
                MERGE (u2)-[:FRIENDS_WITH]->(u1)
                RETURN u1, u2
            `;
            const params = { user1, user2 };
            const result = await session.run(query, params);
            return {
                user1: result.records[0].get('u1').properties,
                user2: result.records[0].get('u2').properties,
            };
        } finally {
            await session.close();
        }
    }

    static async todaysPairing() {
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
              CREATE (a)-[:PAIRED_WITH {date: $today, promptId: $promptId, firstUserId: $firstUserId , userForSide0: $userForSide0 }]->(b)
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

    static async getUserPairing (id) {
        const session = driver.session();
        try {
            const query = `
                MATCH (u:User {id: $id})-[r:PAIRED_WITH {date: $today}]-(pair:User)
                RETURN pair.name AS name, pair.id AS id, pair.avatar AS avatar, r.promptId AS promptId, r.userForSide0 AS userForSide0, r.firstUserId AS firstUserId, r.firstHalfKey AS firstHalfKey, r.secondHalfKey AS secondHalfKey
                LIMIT 1
            `;
            const params = { id, today: todayString() }
            const result = await session.run(query, params)

            if (result.records.length === 0) return null

            const record = result.records[0]
            const promptId = record.get('promptId')
            const prompt = promptsArray.find(p => p.id === promptId)

            const isFirst = record.get('firstUserId') === id
            const maskHalf = record.get('userForSide0') === id
            const mask = maskHalf ? 0 : 1

            return {
              friend: {
                id: record.get('id'),
                name: record.get('name'),
                avatar: record.get('avatar')
              },
              prompt,
              isFirst,
              maskHalf: mask,
              firstHalfKey: record.get('firstHalfKey') || null,
              secondHalfKey: record.get('secondHalfKey') || null
            };
        } finally {
            await session.close();
        }
    }

    static async getFriends (id) {
        const session = driver.session();
        try {
            const query = `
                MATCH (u:User {id: $id})-[:FRIENDS_WITH]->(friend:User)
                RETURN friend
            `;
            const params = { id };
            const result = await session.run(query, params);
            return result.records.map(record => record.get('friend').properties);
        } finally {
            await session.close();
        }
    }

    static async getUser(id) {
      const session = driver.session()
      try {
        const query = `
          MATCH (user:User {id: $id})
          RETURN user
        `;
        const params = { id };
        const result = await session.run(query, params);
    
        if (result.records.length === 0) {
          return null;
        }
    
        const userNode = result.records[0].get('user');
        return { user: userNode.properties };
      } finally {
        await session.close();
      }
    }

    static async updateUser(id, updates) {
      const session = driver.session()
      try {
        const setClauses = []
        const params = { id }

        Object.entries(updates).forEach(([key, value], index) => {
          const paramKey = `field${index}`
          setClauses.push(`user.${key} = $${paramKey}`)
          params[paramKey] = value
        })

        if (setClauses.length === 0) {
          throw new Error('No valid fields provided to update');
        }

        const query = `
          MATCH (user:User {id: $id})
          SET ${setClauses.join(', ')}
          RETURN user
        `

        const result = await session.run(query, params)

        if (result.records.length === 0) {
            return null;
        }

        const updatedUser = result.records[0].get('user')
        return updatedUser.properties
      } finally {
        await session.close();
      }
    }
}