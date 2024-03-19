import { logger } from "@nuxt/kit";
import safeAwait from "safe-await";
import Order from "~/server/models/Order";
import Setting from "~/server/models/Setting";

export default defineEventHandler(async (event) => {

  const body = await readBody(event);
  const eventType = body.type;

  if(eventType === 'checkout.session.completed') {
    if(body.data.object.status === 'complete') {
      const [orderUpdateError] = await safeAwait(Order.updateOne({
        transactionId: body.data.object.id
      }, {
        paymentStatus: 'Complete'
      }));

      if(orderUpdateError) {
        logger.error(orderUpdateError);
        throw createError({
          statusCode: 500,
          statusMessage: 'There was an error updating the completed checkout'
        });
      }
    }
  } 
});
