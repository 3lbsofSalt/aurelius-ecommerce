import safeAwait from "safe-await";
import Order from "~/server/models/Order";
import { useLogger } from "@nuxt/kit";

export default defineEventHandler(async (event) => {
  // Check for route access
  const hasAccess = await hasRouteAccess(event, 'Orders');
  if(!hasAccess) {
    return setResponseStatus(event, 401);
  };

  const logger = useLogger();
  const [error, orders] = await safeAwait(Order.find());

  if(error) {
    logger.error("Error getting orders");
    throw createError({
      statusCode: 500,
      statusMessage: 'There was an error getting the orders.'
    });
  }

  return orders;
});
