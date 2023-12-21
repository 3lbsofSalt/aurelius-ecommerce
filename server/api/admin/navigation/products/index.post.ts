import safeAwait from 'safe-await';
import ProductNavigation from '~/server/models/ProductNavigation';
import { isAlphanumeric } from '~/utils/validationFunctions';
import { useLogger } from '@nuxt/kit';

export default defineEventHandler(async (event) => {
  // Check for route access
  const hasAccess = await hasRouteAccess(event, 'Navigation');
  if(!hasAccess) {
    return setResponseStatus(event, 401);
  };

  const logger = useLogger();
  const body = await readBody(event);
  const { tag } = body;

  const [error] = await safeAwait(ProductNavigation.create({ 
    main: { 
      _id: tag._id,
      name: tag.name
    } 
  }));

  if(error) {
    logger.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: 'There was an creating the navigation category.'
    })
  }
});
