import safeAwait from "safe-await";
import ProductNavigation from "~/server/models/ProductNavigation";
import { useLogger } from "@nuxt/kit";

export default defineEventHandler(async (event) => {
  const logger = useLogger();
  const [error, navCats] = await safeAwait(
    ProductNavigation.find()
      .populate('main')
      .populate('subcategories')
      .exec()
  );

  if(error) {
    logger.error("There was an error retrieving the inventory items.");
    throw createError({
      statusCode: 500,
      statusMessage: 'There was an error getting the inventory items.'
    });
  }

  return navCats;
});
