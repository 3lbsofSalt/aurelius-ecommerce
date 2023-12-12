import safeAwait from "safe-await";
import Tags from "~/server/models/Tag";
import { useLogger } from "@nuxt/kit";

export default defineEventHandler(async (event) => {
  const logger = useLogger();
  const [error, tags] = await safeAwait(Tags.find({ active: true }));

  if(error) {
    logger.error("There was an error retrieving the inventory items.");
    throw createError({
      statusCode: 500,
      statusMessage: 'There was an error getting the inventory items.'
    });
  }

  return tags;
});
