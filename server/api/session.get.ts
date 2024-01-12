import { getServerSession } from '#auth';
import User from '~/server/models/User';
import safeAwait from 'safe-await';
import { useLogger } from '@nuxt/kit';

export default eventHandler(async (event) => {
  const logger = useLogger();
  console.log('iaeiros')
  const session = await getServerSession(event);
  console.log('aeiorstnbxcvzbkmy')

  if(!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthenticated'
    });
  }

  console.log('iaerstembzxcvnea')

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
