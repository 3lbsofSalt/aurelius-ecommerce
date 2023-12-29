import { useLogger } from '@nuxt/kit';
import formidable from 'formidable';
import safeAwait from 'safe-await';
import Tag from '~/server/models/Tag';
import { readFileSync } from 'node:fs';

export default defineEventHandler(async (event) => {
  const hasAccess = await hasRouteAccess(event, 'Inventory');
  if(!hasAccess) {
    return setResponseStatus(event, 401);
  };

  const logger = useLogger();
  const id = getRouterParam(event, 'id');

  const form = formidable();
  const [error, formData] = await safeAwait(form.parse(event.req));

  if(error) {
    logger.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: 'There was an error parsing the form data'
    });
  }

  const [_, files] = formData as any;

  const imageLocation = 'tagImages/' + id + '/' + files.images[0].originalFilename;
  const [uploadError] = await safeAwait(uploadImage(imageLocation, readFileSync(files.images[0].filepath)));
  if(uploadError) {
    logger.error(uploadError);
    throw createError({
      statusCode: 500,
      statusMessage: 'There was an error trying to upload the file'
    });
  }

  const [updateError] = await safeAwait(Tag.updateOne({ _id: id }, {
    imageLocation
  }));

  if(updateError) {
    logger.error(updateError);
    throw createError({
      statusCode: 500,
      statusMessage: 'There was an error updating the navigation category.'
    })
  }

});
