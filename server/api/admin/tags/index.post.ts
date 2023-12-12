import safeAwait from 'safe-await';
import Tags from '../../../models/Tag';
import { isAlphanumeric } from '~/utils/validationFunctions';
import { useLogger } from '@nuxt/kit';

export default defineEventHandler(async (event) => {
  // Check for route access
  const hasAccess = await hasRouteAccess(event, 'Inventory');
  if(!hasAccess) {
    return setResponseStatus(event, 401);
  };

  const logger = useLogger();
  const body = await readBody(event);
  const {
    name
  } = body;

  // Do input validation
  if(!isAlphanumeric(name)) {
    logger.error("The group name had illegal characters in it!");
    throw createError({
      statusCode: 422,
      statusMessage: 'Your group name had characters that were not allowed.'
    });
  }
  const [error] = await safeAwait(Tags.findOneAndUpdate({ name }, { active: true }, { upsert: true }));

  if(error) {
    logger.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: 'There was an error getting the privileges!'
    })
  }
});
