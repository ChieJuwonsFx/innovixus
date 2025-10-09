'use server';

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({ 
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

export async function generateUploadSignature(folder: string) {
  const timestamp = Math.round((new Date).getTime()/1000);

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp: timestamp,
      folder: folder
    },
    process.env.CLOUDINARY_API_SECRET!
  );

  return { timestamp, signature };
}

export async function deleteCloudinaryImage(imageUrl: string) {
  try {
    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    
    if (uploadIndex === -1) {
      console.error('Invalid Cloudinary URL:', imageUrl);
      return { success: false, error: 'Invalid URL format' };
    }

    let pathAfterUpload = urlParts.slice(uploadIndex + 1).join('/');
    
    pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, '');
    
    const publicId = pathAfterUpload.replace(/\.[^.]+$/, '');

    console.log('Deleting image with public_id:', publicId);

    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      console.log('Image deleted successfully:', publicId);
      return { success: true, publicId };
    } else if (result.result === 'not found') {
      console.warn('Image not found in Cloudinary:', publicId);
      return { success: true, publicId, warning: 'not found' };
    } else {
      console.error('Failed to delete image:', result);
      return { success: false, error: result.result };
    }
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    return { success: false, error: String(error) };
  }
}

export async function deleteMultipleCloudinaryImages(imageUrls: string[]) {
  const results = await Promise.allSettled(
    imageUrls.map(url => deleteCloudinaryImage(url))
  );

  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  console.log(`Deleted ${successful} images, ${failed} failed`);
  
  return { successful, failed, results };
}