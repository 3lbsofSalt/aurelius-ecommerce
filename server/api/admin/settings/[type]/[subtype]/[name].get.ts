import safeAwait from "safe-await";
import Setting from '~/server/models/Setting';
import { useLogger } from '@nuxt/kit';

export default defineEventHandler(async (event) => {
  const hasAccess = await hasRouteAccess(event, 'Settings');
  if(!hasAccess) {
    return setResponseStatus(event, 401);
  };
  const logger = useLogger();
  const type = getRouterParam(event, 'type');
  const subtype = getRouterParam(event, 'subtype');
  const name = getRouterParam(event, 'name');

  const [error, setting] = await safeAwait(Setting.findOne({ type, subtype, name }));

  if(error) {
    logger.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: 'There was an error getting the route privileges!'
    })
  }

  return setting;
});
