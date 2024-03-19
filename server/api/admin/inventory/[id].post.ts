import safeAwait from "safe-await";
import InventoryItem from '~/server/models/InventoryItem';
import { useLogger } from '@nuxt/kit';

export default defineEventHandler(async (event) => {
  const hasAccess = await hasRouteAccess(event, 'Inventory')
  if(!hasAccess) {
    return setResponseStatus(event, 401);
  };

  const logger = useLogger();
  const id = getRouterParam(event, 'id');

  const [error] = await safeAwait(InventoryItem.updateOne({ _id: id }, { active: true }));

  if(error) {
    logger.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: 'There was an error getting the privileges!'
    })
  }
});
