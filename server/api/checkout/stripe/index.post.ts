import { useLogger } from "@nuxt/kit";
import safeAwait from "safe-await";
import Setting from "~/server/models/Setting";
import Order from "~/server/models/Order";
import { getCurrentUser } from "~/server/utils/user";
import type { CartItemI } from "~/server/models/subdocuments/Cart";
import Stripe from 'stripe';
import EasyPostClient, { type IRate, type IShipment } from '@easypost/api';
import { baseImageUrl } from "~/utils/imageRetrieval";
import type { PackedBox } from "~/server/utils/binPacking";

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
    billingAddress,
    shippingAddress,
    shipping
  } = body;

  const stripeLineItems = cart.items.map((item : CartItemI) => {
    return {
      price_data: {
        currency: 'USD',
        product_data: {
          name: item.item.name,
          description: item.item.description || 'No Description',
          //images: [baseImageUrl(item.item.baseImagePath || '', item.item.images[0])], // We only need one image
          metadata: {
            _id: String(item.item._id)
          }
        },
        unit_amount_decimal: Math.round(item.item.price * 100),
      },
      quantity: item.quantity
    }
  });

  const total = stripeLineItems.reduce((acc: number, item: any) => {
    return acc + (item.price_data.unit_amount_decimal * item.quantity);
  }, 0);

  const totalTax = Math.round(total * salesTax);

  stripeLineItems.push({
    price_data: {
      currency: 'USD',
      product_data: {
        name: 'Sales Tax',
        description: 'Sales Tax'
      },
      unit_amount_decimal: totalTax
    },
    quantity: 1
  })

  let stripeShippingObject = undefined;
  const shipments: IShipment[] = [];
  const rates: IRate[] = [];
  if(shipping.selectedShipping !== 'pickup') {
    const packedBoxes: PackedBox[] = shipping.packedBoxes;
    const shippingObjectIds: string[] = shipping.shippingObjectIds;
    const selectedShippingRateIds: string[] = shipping.selectedShipping;

    const [apiKeyError, apiKey] = await safeAwait(Setting.findOne({ type: 'shipping', subtype: 'easypost', name: 'apikey' }));
    if(apiKeyError || !apiKey?.value) { logger.error(apiKeyError); throw createError({ statusCode: 500, statusMessage: 'There was an error getting the easypost api key' }); }
    const easyPostClient = new EasyPostClient(apiKey.value);

    for(const shipmentId of shippingObjectIds) {
      const [shipmentError, shipment] = await safeAwait(easyPostClient.Shipment.retrieve(shipmentId));
      if(shipmentError) { logger.error(shipmentError); throw createError({ statusCode: 500, statusMessage: 'There was an error getting the shipment' })}

      shipments.push(shipment);
    }

    let shipmentTotal = 0;
    for(const rateIdIndex in selectedShippingRateIds) {
      const rateId = selectedShippingRateIds[rateIdIndex];
      const shipment =  shipments[rateIdIndex];
      const rate = shipment.rates.find(rate => rate.id === rateId);
      if(!rate) {
        throw createError({ statusCode: 500, statusMessage: 'There was an error getting the correct rate' });
      }
      rates.push(rate);
      shipmentTotal += parseFloat(rate.rate);
    }
    stripeShippingObject = {
      shipping_rate_data: {
        display_name: 'Shipping by ' + rates[0].carrier,
        fixed_amount: {
          amount: Math.ceil((shipmentTotal || 0) * 100),
          currency: 'USD'
        },
        type: 'fixed_amount',
        tax_behavior: 'inclusive'
      }
    }
  }

  console.log(shipping);
  const stripe = new Stripe(stripeKey);

  const [stripeError, checkoutSession] = await safeAwait(stripe.checkout.sessions.create({
    line_items: stripeLineItems,
    mode: 'payment',
    success_url: 'http://localhost:3000',
    shipping_options: stripeShippingObject ? [stripeShippingObject] : undefined
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

  console.log(checkoutSession);

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
    shippingType: shipping.selectedShipping === 'pickup' ? 'Pickup' : 'Shipping',
    shipping: shipping.selectedShipping === 'pickup' ? {} : {
      address: shippingAddress,
      packedBoxes: shipping.packedBoxes,
      selectedShipping: shipping.selectedShipping
    },
    salesTax: totalTax
  }));

  if(orderError) {
    logger.error(orderError);
    throw createError({
      statusCode: 500,
      statusMessage: 'There was an error creating the order for stripe'
    });
  }

  return checkoutSession.url;
});
