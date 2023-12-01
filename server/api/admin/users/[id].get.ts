import safeAwait from "safe-await";
import User from '../../../models/User';
import { useLogger } from '@nuxt/kit';

export default defineEventHandler(async (event) => {
  const logger = useLogger();
  const id = getRouterParam(event, 'id');

  const [error, user] = await safeAwait(User.findOne({ _id: id }));

  if(error) {
    logger.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: 'There was an error getting the route privileges!'
    })
  }

  return user;
});
