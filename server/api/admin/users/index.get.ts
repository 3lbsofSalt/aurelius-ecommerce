import safeAwait from "safe-await";
import User from '../../../models/User';
import { useLogger } from '@nuxt/kit';

export default defineEventHandler(async (event) => {
  const logger = useLogger();

  const [error, users] = await safeAwait(User.find({}));

  if(error) {
    logger.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: 'There was an error getting the route privileges!'
    })
  }

  return users;
});
