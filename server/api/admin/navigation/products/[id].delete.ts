import safeAwait from "safe-await";
import ProductNavigation from "~/server/models/ProductNavigation";
import { useLogger } from '@nuxt/kit';

export default defineEventHandler(async (event) => {
  const hasAccess = await hasRouteAccess(event, 'Inventory')
  if(!hasAccess) {
    return setResponseStatus(event, 401);
  };

  const logger = useLogger();
  const id = getRouterParam(event, 'id');

  const [error] = await safeAwait(ProductNavigation.deleteOne({ _id: id }));

  if(error) {
    logger.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: 'There was an error getting the privileges!'
    })
  }
});
