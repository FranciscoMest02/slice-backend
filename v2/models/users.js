import driver from "../../drivers/neo4j.js";

export class UsersModelV2 {
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
}