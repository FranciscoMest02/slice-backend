const driver = require('../neo4j');

const createFriendship = async (user1, user2) => {
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
};

module.exports = {
    createFriendship,
};