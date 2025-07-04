import driver from "../drivers/neo4j.js";
import { promptsArray } from "../prompts.js";
import todayString from "../utils/date.js";
import { v4 as uuidv4 } from 'uuid';

const MAX_FRIENDS = 6;

export class FriendsModel {
    static async requestFriendship(senderId, receiverId) {
        const session = driver.session();
        try {
            const friendCountQuery = `
                MATCH (u:User {id: $userId})-[:FRIENDS_WITH]->(f:User)
                RETURN count(f) AS friendCount
            `;

            const countResult = await session.run(friendCountQuery, { userId: senderId });
            const currentCount = countResult.records[0].get('friendCount').toInt();

            if (currentCount >= MAX_FRIENDS) {
                await session.close();
                return 'Friend limit reached. Cannot send more requests.'
            }

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
            const friendCountQuery = `
                MATCH (u:User {id: $userId})-[:FRIENDS_WITH]->(f:User)
                RETURN count(f) AS friendCount
            `;

            const deletePendingRequestsQuery = `
                MATCH (u:User {id: $userId})-[r:REQUESTED_FRIEND]->(:User)
                DELETE r
            `;

            const countResult = await session.run(friendCountQuery, { userId });
            const currentCount = countResult.records[0].get('friendCount').toInt();

            if (currentCount >= MAX_FRIENDS) {
                await session.close();
                return 'Friend limit reached. Cannot accept more friends.'
            }

            const query = `
                MATCH (u1:User {id: $userId})<- [r:REQUESTED_FRIEND] - (u2:User {id: $friendId})
                DELETE r
                CREATE (u1)-[:FRIENDS_WITH]->(u2)
                CREATE (u2)-[:FRIENDS_WITH]->(u1)
                WITH u1, u2
                OPTIONAL MATCH (u1)-[m1:PAIRED_WITH {date: $today}]-()
                OPTIONAL MATCH (u2)-[m2:PAIRED_WITH {date: $today}]-()
                WITH u1, u2, count(m1) AS u1Pairs, count(m2) AS u2Pairs
                RETURN u1, u2, u1Pairs = 0 AS u1CanMatch, u2Pairs = 0 AS u2CanMatch
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

            const countAfter = await session.run(friendCountQuery, { userId });
            const updatedCount = countAfter.records[0].get('friendCount').toInt();

            if (updatedCount >= MAX_FRIENDS) {
                await session.run(deletePendingRequestsQuery, { userId });
            }

            return {
                user: result.records[0].get('u1').properties,
                friend: result.records[0].get('u2').properties,
            };

        } finally {
            await session.close();
        }
    }

    static async removeFriend(userId, friendId) {
        const session = driver.session();
        try {
            const query = `
                MATCH (u1:User {id: $userId})-[r:FRIENDS_WITH]-(u2:User {id: $friendId})
                DELETE r
                RETURN u1, u2
            `;
            const params = { userId, friendId };
            const result = await session.run(query, params);
            return {
                user: result.records[0].get('u1').properties,
                friend: result.records[0].get('u2').properties,
            };
        } finally {
            await session.close();
        }
    }

    static async blockUser(userId, blockedId) {
        const session = driver.session();
        try {
            const query = `
                MATCH (u1:User {id: $userId}), (u2:User {id: $blockedId})
                OPTIONAL MATCH (u1)-[r1:FRIENDS_WITH]->(u2)
                OPTIONAL MATCH (u2)-[r2:FRIENDS_WITH]->(u1)
                DELETE r1, r2
                MERGE (u1)-[:BLOCKED]->(u2)
                RETURN u1, u2
            `;
            const params = { userId, blockedId };
            const result = await session.run(query, params);
            return {
                user: result.records[0].get('u1').properties,
                blocked: result.records[0].get('u2').properties,
            };
        } finally {
            await session.close();
        }
    }

    static async unblockUser(userId, blockedId) {
        const session = driver.session();
        try {
            const query = `
                MATCH (u1:User {id: $userId})-[r:BLOCKED]-(u2:User {id: $blockedId})
                DELETE r
                RETURN u1, u2
            `;
            const params = { userId, blockedId };
            const result = await session.run(query, params);
            return {
                user: result.records[0].get('u1').properties,
                unblocked: result.records[0].get('u2').properties,
            };
        } finally {
            await session.close();
        }
    }

    static async isBlocked(userId, blockedId) {
        const session = driver.session();
        try {
            const query = `
                MATCH (u1:User {id: $userId})-[r:BLOCKED]-(u2:User {id: $blockedId})
                RETURN u2 { .id, .name } AS blocked
            `;
            const params = { userId, blockedId };
            const result = await session.run(query, params);
            return result.records.length > 0 ? result.records[0].get('blocked') : null;
        } finally {
            await session.close();
        }
    }

    static async friendRequestExists(userId, friendId) {
        const session = driver.session()
        try {
            const query = `
                MATCH (u1:User {id: $userId})<-[:REQUESTED_FRIEND]-(u2:User {id: $friendId})
                RETURN u2 { .id, .name } AS from
            `;
            const params = { userId, friendId };
            const result = await session.run(query, params);
            return result.records.length > 0 ? result.records[0].get('from') : null;
        } finally {
            await session.close();
        }
    }

    static async areFriends(userId, friendId) {
        const session = driver.session();
        try {
            const query = `
                MATCH (u1:User {id: $userId})-[:FRIENDS_WITH]-(u2:User {id: $friendId})
                RETURN u2 { .id, .name } AS friend
            `;
            const params = { userId, friendId };
            const result = await session.run(query, params);
            return result.records.length > 0 ? result.records[0].get('friend') : null;
        } finally {
            await session.close();
        }
    }
}