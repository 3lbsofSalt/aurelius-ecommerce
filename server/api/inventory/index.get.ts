import safeAwait from "safe-await";
import InventoryItem from "~/server/models/InventoryItem";
import { useLogger } from "@nuxt/kit";

export default defineEventHandler(async (event) => {
  const logger = useLogger();

  const query = getQuery(event);

  const criteria = {
    active: true
  };

  if(query.categoryId) {
    //@ts-ignore
    criteria.tags = {
      '$elemMatch': {
        '_id': query.categoryId
      }
    }
  }

  const [error, inventoryItems] = await safeAwait(InventoryItem.find(criteria));

  if(error) {
    logger.error("There was an error retrieving the inventory items.");
    throw createError({
      statusCode: 500,
      statusMessage: 'There was an error getting the inventory items.'
    });
  }

  return inventoryItems;
});
