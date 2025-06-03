import { ImagesModel } from "../models/images.js";


export class ImagesController {
    static async generatePresignedUploadURL (req, res) {
        const { key, contentType = 'image/jpeg' } = req.query;
        
        if (!key) return res.status(400).json({ error: 'Missing key' });
    
        try {
            const url = await ImagesModel.generatePresignedUploadURL(key, contentType);
            res.json({ url });
        } catch (err) {
            console.error('Upload URL error:', err);
            res.status(500).json({ error: 'Failed to generate upload URL' });
        }
    }

    static async generatePresignedDownloadURL (req, res) {
        const { key } = req.query;

        if (!key) return res.status(400).json({ error: 'Missing key' });

        try {
            const url = await ImagesModel.generatePresignedDownloadURL(key);
            res.json({ url });
        } catch (err) {
            console.error('Download URL error:', err);
            res.status(500).json({ error: 'Failed to generate download URL' });
        }
    }

    static async imageUploaded (req, res) {
        const { key } = req.body;
        let userId = req.params.id;

        if (!userId) return res.status(400).json({ error: 'Missing user ID' });

        if (!key) return res.status(400).json({ error: 'Missing key' });

        userId = userId.toLowerCase();

        try {
            const result = await ImagesModel.imageUploaded(key, userId);
            console.log(result)
            res.status(200).json({ message: 'Image upload acknowledged', result });
        } catch (err) {
            console.error('Image upload error:', err);
            res.status(500).json({ error: 'Failed to acknowledge image upload' });
        }
    }
}