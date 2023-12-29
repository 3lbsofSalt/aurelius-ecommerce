import { useLogger } from "@nuxt/kit";
import safeAwait from "safe-await";
import Order from "~/server/models/Order";
import { getCurrentUser } from "~/server/utils/user";

export default defineEventHandler(async (event) => {
  const logger = useLogger();

  const body = await readBody(event);
  const {
    billingAddress,
    shippingAddress,
    cart,
  } = body;

  const [_, user] = await safeAwait(getCurrentUser(event));

  const [orderCreateError, order] = await safeAwait(Order.create({
    name: 'Online Order for ' + billingAddress.fullname,
    customer: user?._id,
    customerContactInfo: {
      email: billingAddress.email,
      phone: billingAddress.phone,
    },
    cart,
    paymentType: 'On Pickup',
    paymentStatus: 'Pending',
    orderStatus: 'Processing',
    shippingType: 'Pickup',
    billingAddress: {
      ...billingAddress,
    },
  }));

  if(orderCreateError) {
    logger.error(orderCreateError);
    throw createError({
      statusCode: 500,
      statusMessage: 'There was an error creating the order'
    });
  }

  return order._id;
});
