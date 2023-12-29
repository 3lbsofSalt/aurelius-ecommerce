import { useLogger } from "@nuxt/kit";
import safeAwait from "safe-await";
import Setting from "~/server/models/Setting";
import Order from "~/server/models/Order";
import { getCurrentUser } from "~/server/utils/user";
import type { CartItemI } from "~/server/models/subdocuments/Cart";
import Stripe from 'stripe';
import { baseImageUrl } from "~/utils/imageRetrieval";

export default defineEventHandler(async (event) => {
  const logger = useLogger();

  const [settingError, settings] = await safeAwait(Setting.find({
    type: ['orders', 'externalApps'],
    subtype: ['taxes', 'checkout'],
    name: ['salesTax', 'stripeApiKey']
  }));

  if(settingError) {
    logger.error(settingError);
    throw createError({
      statusCode: 500,
      statusMessage: 'There was an error getting the stripe settings'
    });
  }

  const stripeKey = settings.find((setting) => setting.type === 'externalApps' && setting.subtype === 'checkout' && setting.name === 'stripeApiKey')?.value;
  if(!stripeKey) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Stripe is not configured'
    });
  }

  const salesTax = settings.find(setting => setting.name === 'salesTax')?.value;

  if(!salesTax) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Sales tax is not configured'
    });
  }

  const body = await readBody(event);
  const {
    cart,
    billingAddress
  } = body;

  const stripeLineItems = cart.items.map((item : CartItemI) => {
    return {
      price_data: {
        currency: 'USD',
        product_data: {
          name: item.item.name,
          description: item.item.description,
          //images: [baseImageUrl(item.item.baseImagePath || '', item.item.images[0])], // We only need one image
          metadata: {
            _id: String(item.item._id)
          }
        },
        unit_amount_decimal: item.item.price * 100,
      },
      quantity: item.quantity
    }
  });

  const stripe = new Stripe(stripeKey);

  const [stripeError, checkoutSession] = await safeAwait(stripe.checkout.sessions.create({
    line_items: stripeLineItems,
    mode: 'payment',
    success_url: 'http://localhost:3000',
    //cancel_url:  'localhost:3000'
  }));

  if(stripeError || !checkoutSession.url) {
    logger.error(stripeError);
    throw createError({
      statusCode: 500,
      statusMessage: 'Stripe had a bad error'
    });
  }

  const [_, user] = await safeAwait(getCurrentUser(event));

  const [orderError] = await safeAwait(Order.create({
    name: 'Online Order for ' + billingAddress.fullname,
    customerContactInfo: {
      email: billingAddress.email,
      phone: billingAddress.phone
    },
    cart: cart,
    customer: user?._id,
    total: cart.total,
    billingAddress: {
      ...billingAddress
    },
    transactionId: checkoutSession.id,
    paymentType: 'Stripe',
    paymentStatus: 'Pending',
    orderStatus: 'Processing',
  }));

  if(orderError) {
    logger.error(orderError);
    throw createError({
      statusCode: 500,
      statusMessage: 'There was an error creating the order for stripe'
    });
  }

  sendRedirect(event, checkoutSession.url, 303);
});
