// testNeo4j.js
const neo4j = require('neo4j-driver');
require('dotenv').config();

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

(async () => {
  const session = driver.session();
  try {
    const res = await session.run('MATCH (u:User) RETURN u.id AS id');
    res.records.forEach(r => console.log(r.get('id')));
  } finally {
    await session.close();
    await driver.close();
  }
})();
