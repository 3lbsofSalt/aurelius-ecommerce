import safeAwait from 'safe-await';

import {
  CopyObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3';

const defaultBucketSettings = {
  Bucket: process.env.DIGITAL_OCEAN_SPACES_BUCKET,
  ACL: 'public-read'
};


// @ts-ignore
const s3Client = new S3Client({
  endpoint: process.env.DIGITAL_OCEAN_SPACES_ENDPOINT,
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.DIGITAL_OCEAN_SPACES_PUBLIC_KEY,
    secretAccessKey: process.env.DIGITAL_OCEAN_SPACES_SECRET_KEY
  }
});

/**
 * upload an image to the S3 bucket
 * imageLocation - String - a filepath where the image will reside
 * imageContents - Buffer - a buffer with the imagesContents
 * */
export const uploadImage = (imageLocation : string, imageContents : Buffer) => {
  return new Promise(async (resolve, reject) => {
    console.log('Beginning Upload...');
    const imageData = {
      ...defaultBucketSettings,
      Key: process.env.DIGITAL_OCEAN_SPACES_FILE_PREFIX + imageLocation,
      Body: imageContents
    };

    // @ts-ignore I don't know the types and this always works, so I'm fine with it
    const [ error ] = await safeAwait(s3Client.send(new PutObjectCommand(imageData)));

    console.log('Upload Complete.');
    if(error) {
      return reject(error);
    }

    return resolve(true);
  });

};

export const deleteImage = (imageLocation: string) => {
  return new Promise(async (resolve, reject) => {

    const params = {
      ...defaultBucketSettings,
      Key: process.env.DIGITAL_OCEAN_SPACES_FILE_PREFIX + imageLocation
    };

    const [ error ] = await safeAwait(s3Client.send(new DeleteObjectCommand(params)));

    if(error) {
      return reject(error);
    }

    return resolve(true);
  });
};

export const moveImage = (imageLocation : string, newImageLocation : string) => {
  return new Promise(async (resolve, reject) => {
    const params = {
      ...defaultBucketSettings,
      Key: process.env.DIGITAL_OCEAN_SPACES_FILE_PREFIX + newImageLocation,
      CopySource: `/${process.env.DIGITAL_OCEAN_SPACES_BUCKET}/${process.env.DIGITAL_OCEAN_SPACES_FILE_PREFIX}${imageLocation}`
    };

    // @ts-ignore I don't know the types and this always works, so I'm fine with it
    const [ error ] = await safeAwait(s3Client.send(new CopyObjectCommand(params)));

    if(error) {
      console.log(error);
      return reject(error);
    }

    const [deleteError] = await safeAwait(deleteImage(imageLocation));
    if(deleteError) {
      console.log(deleteError);
      return reject(deleteError);
    }

    return resolve(true);
  });
}
