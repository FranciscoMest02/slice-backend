import driver from "../drivers/neo4j.js";
import todayString from "../utils/date.js";

export class UsersModel {
    static async createUser (id, name) {
        const session = driver.session();
        try {
            const query = `
                CREATE (u:User {id: $id, name: $name})
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
            pair[0].name AS user1,
            pair[1].name AS user2;
    
        `, { today });
    
        return result.records.map(record => ({
          user1: record.get('user1'),
          user2: record.get('user2')
        }));
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
}