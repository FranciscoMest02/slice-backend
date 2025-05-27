import driver from "../drivers/neo4j.js";

export class FriendsModel {
    static async requestFriendship(senderId, receiverId) {
        const session = driver.session();
        try {
            const query = `
                MATCH (sender:User {id: $senderId}), (receiver:User {id: $receiverId})
                MERGE (sender)-[:REQUESTED_FRIEND]->(receiver)
                RETURN sender, receiver
            `;
            const params = { senderId, receiverId };
            const result = await session.run(query, params);
            return {
                sender: result.records[0].get('sender').properties,
                receiver: result.records[0].get('receiver').properties,
            };
        } finally {
            await session.close();
        }
    }

    static async getFriendRequests(userId) {
        const session = driver.session();
        try {
            const query = `
                MATCH (u:User {id: $userId})<-[:REQUESTED_FRIEND]-(requester:User)
                RETURN requester { .id, .name, .avatar }
            `;
            const params = { userId };
            const result = await session.run(query, params);
            console.log('Friend requests for user:', userId, 'Result:', result.records);
            return result.records.map(record => record.get('requester'));
        } finally {
            await session.close();
        }
    }

    static async acceptFriendRequest(userId, friendId) {
        const session = driver.session();
        try {
            const query = `
                MATCH (u1:User {id: $userId})<- [r:REQUESTED_FRIEND] - (u2:User {id: $friendId})
                DELETE r
                CREATE (u1)-[:FRIENDS_WITH]->(u2)
                CREATE (u2)-[:FRIENDS_WITH]->(u1)
                RETURN u1 as sender, u2 as requester
            `;
            const params = { userId, friendId };
            const result = await session.run(query, params);
            return {
                user: result.records[0].get('sender').properties,
                friend: result.records[0].get('requester').properties,
            };
        } finally {
            await session.close();
        }
    }
}