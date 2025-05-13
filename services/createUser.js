const driver = require('../neo4j'); // Ensure this points to your Neo4j driver setup

const createUser = async (id, name) => {
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
};

module.exports = {
    createUser,
};