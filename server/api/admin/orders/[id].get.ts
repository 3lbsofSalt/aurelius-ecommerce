import safeAwait from "safe-await";
import Order from '~/server/models/Order';
import { useLogger } from '@nuxt/kit';

export default defineEventHandler(async (event) => {
  const hasAccess = await hasRouteAccess(event, 'Users')
  if(!hasAccess) {
    return setResponseStatus(event, 401);
  };
  const logger = useLogger();
  const id = getRouterParam(event, 'id');

  const [error, order] = await safeAwait(Order.findOne({ _id: id }));

  if(error) {
    logger.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: 'There was an error getting the specified order!'
    })
  }

  return order;
});
