import safeAwait from 'safe-await';
import Privileges from '../../../models/Privileges';
import { isAlphanumeric } from '~/utils/validationFunctions';
import { useLogger } from '@nuxt/kit';

export default defineEventHandler(async (event) => {
  // Check for route access
  const hasAccess = await hasRouteAccess(event, 'Privileges');
  if(!hasAccess) {
    return setResponseStatus(event, 401);
  };

  const logger = useLogger();
  const body = await readBody(event);
  const {
    group
  } = body;

  // Do input validation
  if(!isAlphanumeric(group)) {
    logger.error("The group name had illegal characters in it!");
    throw createError({
      statusCode: 422,
      statusMessage: 'Your group name had characters that were not allowed.'
    });
  }
  const [error] = await safeAwait(Privileges.create({ group }));

  if(error) {
    logger.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: 'There was an error getting the privileges!'
    })
  }
});
