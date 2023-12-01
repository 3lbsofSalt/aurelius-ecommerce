import safeAwait from "safe-await";
import RoutePrivileges from '../../../models/RoutePrivileges';
import { useLogger } from '@nuxt/kit';

export default defineEventHandler(async (event) => {
  const logger = useLogger();

  const [error, routePrivileges] = await safeAwait(RoutePrivileges.find({}));

  if(error) {
    logger.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: 'There was an error getting the route privileges!'
    })
  }

  return routePrivileges;

});
