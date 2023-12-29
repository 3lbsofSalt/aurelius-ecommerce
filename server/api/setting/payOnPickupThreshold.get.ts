import safeAwait from "safe-await";
import Setting from "~/server/models/Setting";
import { useLogger } from "@nuxt/kit";

export default defineEventHandler(async (event) => {
  const logger = useLogger();
  const [error, setting] = await safeAwait(Setting.findOne({
    type: 'orders',
    subtype: 'checkout',
    name: 'payOnPickupThreshold'
  }));

  console.log(setting);

  if(error) {
    logger.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: 'There was an error getting the pay on pickup threshold.'
    });
  }

  return setting.value;
});
