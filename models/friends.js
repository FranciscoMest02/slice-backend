import driver from "../drivers/neo4j.js";
import { promptsArray } from "../prompts.js";
import todayString from "../utils/date.js";
import { v4 as uuidv4 } from 'uuid';

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
        const today = todayString();

        try {
            const query = `
                MATCH (u1:User {id: $userId})<- [r:REQUESTED_FRIEND] - (u2:User {id: $friendId})
                DELETE r
                CREATE (u1)-[:FRIENDS_WITH]->(u2)
                CREATE (u2)-[:FRIENDS_WITH]->(u1)
                WITH u1, u2
                OPTIONAL MATCH (u1)-[m1:PAIRED_WITH {today: $today}]-()
                OPTIONAL MATCH (u2)-[m2:PAIRED_WITH {today: $today}]-()
                RETURN u1, u2, m1 IS NULL AS u1CanMatch, m2 IS NULL AS u2CanMatch
            `;
            const params = { userId, friendId, today };
            const result = await session.run(query, params);

            const record = result.records[0];
            const u1CanMatch = record.get('u1CanMatch');
            const u2CanMatch = record.get('u2CanMatch');

            if (u1CanMatch && u2CanMatch) {
                const prompt = promptsArray[Math.floor(Math.random() * promptsArray.length)];

                const goesFirst = Math.random() < 0.5;
                const isFirstSide = Math.random() < 0.5;

                const pairArray = [userId, friendId];
                const firstUserId = pairArray[goesFirst ? 0 : 1];
                const userForSide0 = pairArray[isFirstSide ? 0 : 1];

                const sliceId = uuidv4()

                await session.run(`
                    MATCH (a:User {id: $user1}), (b:User {id: $user2})
                    CREATE (a)-[:PAIRED_WITH {
                        id: $sliceId,
                        date: $today,
                        notificationSent: true,
                        promptId: $promptId,
                        firstUserId: $firstUserId,
                        userForSide0: $userForSide0
                    }]->(b)
                `, {
                    sliceId,
                    user1: userId,
                    user2: friendId,
                    today,
                    promptId: prompt.id,
                    firstUserId,
                    userForSide0
                });
            }
            return {
                user: result.records[0].get('u1').properties,
                friend: result.records[0].get('u2').properties,
            };

        } finally {
            await session.close();
        }
    }
}