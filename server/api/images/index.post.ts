import safeAwait from "safe-await";
import formidable from 'formidable';
import { randomUUID } from 'crypto';
import { readFileSync } from 'node:fs';

export default defineEventHandler(async (event) => {
  const form = formidable({});
  const [error, formData] = await safeAwait(form.parse(event.req));

  if(error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'There was an error parsing the form data'
    });
  }

  const [_, files] = formData as any;

  const uuid = randomUUID();

  const imagesUploading = [];
  const imagesName : string[] = [];
  for(const image in files.images) {
    const imageBuf = readFileSync(files.images[image].filepath);
    const fileLocation = 'customer_uploads/' + uuid + '/' + files.images[image].originalFilename;
    imagesName.push(fileLocation);
    imagesUploading.push(
      uploadImage(fileLocation, imageBuf)
    );
  }

  const [imageErrors] = await safeAwait(Promise.all(imagesUploading));

  if(imageErrors) {
    throw createError({
      statusCode: 500,
      statusMessage: 'There was an error uploading uploading the images.'
    });
  }

  return imagesName;
});
