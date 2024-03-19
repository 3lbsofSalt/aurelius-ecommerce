import { useLogger } from '@nuxt/kit';
import safeAwait from 'safe-await';
import NavigationCategory from '~/server/models/ProductNavigation';

export default defineEventHandler(async (event) => {
  const hasAccess = await hasRouteAccess(event, 'Inventory');
  if(!hasAccess) {
    return setResponseStatus(event, 401);
  };

  const logger = useLogger();
  const id = getRouterParam(event, 'id');

  const body = await readBody(event);
  const {
    subcategories
  } = body;

  const [updateError] = await safeAwait(NavigationCategory.updateOne({ _id: id }, {
    subcategories
  }));

  if(updateError) {
    logger.error(updateError);
    throw createError({
      statusCode: 500,
      statusMessage: 'There was an error updating the navigation category.'
    })
  }

});
