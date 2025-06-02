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
                SET r.imageKey = $key, r.imageURL = $url
                RETURN u1.id AS u1Id, u2.id AS u2Id, r.imageKey AS imageKey
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
                imageURL: record.get('imageKey')
            };
        } finally {
            await session.close();
        }
    }
}