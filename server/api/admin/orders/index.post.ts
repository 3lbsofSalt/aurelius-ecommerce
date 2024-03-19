import safeAwait from "safe-await";
import Order from "~/server/models/Order";
import { useLogger } from "@nuxt/kit";
import { emptyCart } from "~/server/models/subdocuments/Cart";

export default defineEventHandler(async (event) => {
  // Check for route access
  const hasAccess = await hasRouteAccess(event, 'Orders');
  if(!hasAccess) {
    return setResponseStatus(event, 401);
  };

  const logger = useLogger();
  const [error, order] = await safeAwait(Order.create({
    name: 'New Order',
    cart: emptyCart,
  }));

  if(error) {
    logger.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: 'There was an error creating the order.'
    });
  }

  return order;
});
