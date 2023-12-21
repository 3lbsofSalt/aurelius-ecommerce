import { getServerSession } from '#auth';
import User from '../models/User';
import safeAwait from 'safe-await';
import { useLogger } from '@nuxt/kit';
import { eventHandler } from '#imports';

export default eventHandler(async (event) => {
  const logger = useLogger();
  const session = await getServerSession(event);

  if(!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthenticated'
    });
  }

  const [error, user] = await safeAwait(User.findOne({ email: session.user.email }, '-hash -activationToken -resetToken'));
  if(error) {
    logger.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Server Error Getting User'
    });
  }

  if(!user) {
    const [userCreateError] = await safeAwait(User.create({ email: session.user.email }));

    if(userCreateError) {
      logger.error(userCreateError);
      logger.error({
        statusCode: 500,
        statusMessage: 'Server Error Creating User'
      });
    }
  }

  return user;
});
