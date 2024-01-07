import safeAwait from "safe-await";
import Setting from "~/server/models/Setting";
import { useLogger } from "@nuxt/kit";
import { getShipstationAPIKey, type carrierType, type shippingAddressType } from "~/server/utils/shipping";
import type { WeightI } from "~/server/models/InventoryItem";
import type { CartI } from "~/server/models/subdocuments/Cart";
import { packInBins } from "~/server/utils/binPacking";
import EasyPostClient, { type IShipment } from '@easypost/api';
import type { AddressI } from "~/server/models/Order";

export default defineEventHandler(async (event) => {
  const logger = useLogger();

  const query = getQuery(event);
  const shippingAddress = JSON.parse(query.shippingAddress as string);

  console.log(shippingAddress);
  if(!shippingAddress || 
    !shippingAddress.city || 
    !shippingAddress.state || 
    !shippingAddress.country ||
    !shippingAddress.postalcode
  ) {
    logger.error('Not enough data for rates');
    throw createError({
      statusCode: 400,
      statusMessage: 'User did not provide enough data. Needs city, state, country, zipcode, and weight in grams'
    });
  }

  const cart: CartI = JSON.parse(query.cart as any) as CartI;
  const [binsError, packedBins] = await safeAwait(packInBins(cart.items));
  if(binsError) {
    logger.error(binsError);
    throw createError({
      statusCode: 500, 
      statusMessage: 'There was an error packing the cart for shipping'
    });
  }


  const [apiKeyError, apiKey] = await safeAwait(Setting.findOne({ type: 'shipping', subtype: 'easypost', name: 'apikey' }));
  if(apiKeyError || !apiKey?.value) { logger.error(apiKeyError); throw createError({ statusCode: 500, statusMessage: 'There was an error getting the easypost api key' }); }

  const [addressError, fromAddress] = await safeAwait(Setting.findOne({ type: 'shipping', subtype: 'shipFrom', name: 'address' }));
  if(addressError || !fromAddress?.value) { throw createError({ statusCode: 500, statusMessage: 'There was an error getting the from address' }); }
  const address = fromAddress.value as AddressI;

  const easyPostClient = new EasyPostClient(apiKey.value);

  const shipments: IShipment[] = [];

  for(const bin of packedBins) {
    const [shipmentError, easyPostShipment] = await safeAwait(easyPostClient.Shipment.create({
      to_address: {
        street1: shippingAddress.street1,
        street2: shippingAddress.street2,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zip: shippingAddress.postalcode,
        country: shippingAddress.country,
        name: shippingAddress.fullname,
        company: shippingAddress.company,
        phone: shippingAddress.phone,
        residential: !!shippingAddress.company,
        verify: true
      },
      from_address: {
        street1: address.street1,
        street2: address.street2,
        city: address.city,
        state: address.state,
        zip: address.postalcode,
        country: address.country,
        name: address.fullname,
        company: address.company,
        phone: address.phone,
        residential: !!address.company,
        verify: true
      },
      parcel: {
        length: bin.dimensions.length,
        width: bin.dimensions.width,
        height: bin.dimensions.height,
        weight: bin.weightInGrams / 28.34952
      }
    }));

    if(shipmentError) {
      logger.error(shipmentError);
      throw createError({ });
    }

    shipments.push(easyPostShipment);
  }

  return [packedBins, shipments];
});
