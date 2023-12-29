import safeAwait from "safe-await";
import Setting from "~/server/models/Setting";
import { useLogger } from "@nuxt/kit";
import { getShipstationAPIKey, type carrierType, type shippingAddressType } from "~/server/utils/shipping";
import type { WeightI } from "~/server/models/InventoryItem";

export default defineEventHandler(async (event) => {
  const logger = useLogger();

  const query = getQuery(event);
  const shippingAddress = JSON.parse(query.shippingAddress as string);
  const weightInGrams = query.weightInGrams as number;

  if(!shippingAddress || 
    !shippingAddress.city || 
    !shippingAddress.state || 
    !shippingAddress.country ||
    !shippingAddress.zipcode ||
    !weightInGrams
  ) {
    logger.error('Not enough data for rates');
    throw createError({
      statusCode: 400,
      statusMessage: 'User did not provide enough data. Needs city, state, country, zipcode, and weight in grams'
    });
  }

  const [apiKeyError, apiKey] = await safeAwait(getShipstationAPIKey());
  if(apiKeyError) { logger.error(apiKeyError); throw createError({ statusCode: 500, statusMessage: 'There was an error getting the shipstation api key' }); }
  const [zipCodeError, fromPostalCode] = await safeAwait(Setting.findOne({
    type: 'externalApps',
    subtype: 'shipping',
    name: 'shipFromZipCode'
  }));
  if(zipCodeError || !fromPostalCode) { throw createError({ statusCode: 500, statusMessage: 'There was an error getting the from zip code. Perhaps it is not configured?' }) }

  const [carriersError, carriers] = await safeAwait($fetch('https://ssapi.shipstation.com/carriers', {
    headers: {
      Authorization: 'Basic ' + apiKey
    }
  }));

  if(carriersError) { logger.error(carriersError); throw createError({ statusCode: 500, statusMessage: 'There was an error getting the shipstation carriers.' }); }

  const shippingOptions = [];
  for(const carrier of carriers as carrierType[]) {
    console.log(carrier);
    console.log(carrier.code);
    const [ratesError, rates] = await safeAwait($fetch('https://ssapi.shipstation.com/shipments/getrates', {
      method: 'post',
      headers: {
        Authorization: 'Basic ' + apiKey
      },
      body: {
        fromPostalCode: fromPostalCode.value,
        carrierCode: carrier.code,
        toState: shippingAddress.state,
        toCountry: shippingAddress.country,
        toPostalCode: shippingAddress.zipcode,
        toCity: shippingAddress.city,
        residential: !shippingAddress.company,
        weight: {
          units: 'grams',
          quantity: weightInGrams
        }
      }
    }));
    console.log(ratesError);
    console.log(rates);
  }
});
