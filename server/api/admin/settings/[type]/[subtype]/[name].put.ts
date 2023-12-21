import safeAwait from "safe-await";
import Setting from "~/server/models/Setting";
import { useLogger } from "@nuxt/kit";

export default defineEventHandler(async (event) => {
  const hasAccess = await hasRouteAccess(event, 'Settings');
  if(!hasAccess) {
    return setResponseStatus(event, 401);
  };

  const logger = useLogger();

  const type = getRouterParam(event, 'type');
  const subtype = getRouterParam(event, 'subtype');
  const name = getRouterParam(event, 'name');

  const body = await readBody(event);
  const { value } = body;

  const [error, tags] = await safeAwait(Setting.updateOne({ type, subtype, name }, { value }, { upsert: true }));

  if(error) {
    logger.error("There was an error retrieving the inventory items.");
    throw createError({
      statusCode: 500,
      statusMessage: 'There was an error getting the inventory items.'
    });
  }

  return tags;
});
