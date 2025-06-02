import { Router } from 'express'
import { ImagesController } from '../controllers/images.js';

export const imagesRouter = Router()

// Generate pre-signed URL for UPLOAD
imagesRouter.get('/generate-upload-url', ImagesController.generatePresignedUploadURL);
// Generate pre-signed URL for DOWNLOAD
imagesRouter.get('/generate-download-url',ImagesController.generatePresignedDownloadURL);
// Tell the backend that the image has been uploaded
imagesRouter.post('/uploaded/:id', ImagesController.imageUploaded);