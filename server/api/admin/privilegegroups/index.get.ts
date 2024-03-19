import safeAwait from "safe-await";
import Privileges from '../../../models/Privileges';
import { useLogger } from '@nuxt/kit';

export default defineEventHandler(async (event) => {
  const hasAccess = await hasRouteAccess(event, 'Privileges');
  if(!hasAccess) {
    return setResponseStatus(event, 401);
  };

  const logger = useLogger();

  const [error, privileges] = await safeAwait(Privileges.find({}));

  if(error) {
    logger.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: 'There was an error getting the privileges!'
    })
  }

  return privileges;
});
