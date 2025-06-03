import { s3 } from '../drivers/s3aws.js';
import driver from "../drivers/neo4j.js";
import todayString from "../utils/date.js";


const BUCKET_NAME = process.env.S3_BUCKET_NAME;

export class ImagesModel {
    static async generatePresignedUploadURL (key, contentType = 'image/jpeg') {
        const params = {
            Bucket: BUCKET_NAME,
            Key: key,
            ContentType: contentType,
            Expires: 60 * 60 * 24 * 3 // 3 days
        };

        return s3.getSignedUrlPromise('putObject', params);
    };

    static async generatePresignedDownloadURL (key) {
        const params = {
            Bucket: BUCKET_NAME,
            Key: key,
            Expires: 60 * 60 * 24 * 3 // 3 days
        };

        return s3.getSignedUrlPromise('getObject', params);
    };

    static async imageUploaded (key, userId) {
        const session = driver.session()
        const today = todayString()
        const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`
        
        try {
            const query = `
                MATCH (u1:User {id: $userId})-[r:PAIRED_WITH {date: $today}]-(u2:User)
                WITH r, u1, u2, $key AS key, $url AS url,
                    CASE WHEN r.firstUserId = $userId THEN true ELSE false END AS isFirst
                CALL {
                    WITH r, isFirst, key, url
                    WITH r,
                        CASE WHEN isFirst THEN key ELSE r.firstHalfKey END AS firstHalfKey,
                        CASE WHEN isFirst THEN url ELSE r.firstHalfUrl END AS firstHalfUrl,
                        CASE WHEN isFirst THEN r.secondHalfKey ELSE key END AS secondHalfKey,
                        CASE WHEN isFirst THEN r.secondHalfUrl ELSE url END AS secondHalfUrl
                    SET r.firstHalfKey = firstHalfKey,
                        r.firstHalfUrl = firstHalfUrl,
                        r.secondHalfKey = secondHalfKey,
                        r.secondHalfUrl = secondHalfUrl
                }
                RETURN u1.id AS u1Id, u2.id AS u2Id, r.firstUserId AS firstUserId, r.firstHalfUrl AS firstHalfUrl, r.secondHalfUrl AS secondHalfUrl
            `;
            const params = { userId, today, key, url };
            const result = await session.run(query, params);

            if (result.records.length === 0) {
                throw new Error('No paired connection found for today');
            }

            const record = result.records[0];
            const firstHalfUrl = record.get('firstHalfUrl');
            const secondHalfUrl = record.get('secondHalfUrl');
            const firstUserId = record.get('firstUserId');

            const uploadedUrl = (userId === firstUserId) ? firstHalfUrl : secondHalfUrl;

            return {
                user: record.get('u1Id'),
                friend: record.get('u2Id'),
                imageURL: uploadedUrl
            };
        } finally {
            await session.close();
        }
    }

    static async finalImageUploaded(key, userId) {
        const session = driver.session();
        const today = todayString();
        const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;

        try {
            const query = `
                MATCH (u1:User {id: $userId})-[r:PAIRED_WITH {date: $today}]-(u2:User)
                SET r.finalKey = $key,
                    r.finalUrl = $url
                RETURN u1.id AS u1Id, u2.id AS u2Id, r.finalUrl AS finalUrl
            `;
            const params = { userId, today, key, url };
            const result = await session.run(query, params);

            if (result.records.length === 0) {
                throw new Error('No paired connection found for today');
            }

            const record = result.records[0];
            return {
                user: record.get('u1Id'),
                friend: record.get('u2Id'),
                imageURL: record.get('finalUrl')
            };
        } finally {
            await session.close();
        }
    }
}