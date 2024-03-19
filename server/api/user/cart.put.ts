import { getServerSession } from '#auth';
import User from '~/server/models/User';
import safeAwait from 'safe-await';
import { useLogger } from '@nuxt/kit';

export default defineEventHandler(async (event) => {
  const logger = useLogger();
  const session = await getServerSession(event);

  if(!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthenticated'
    });
  }
  const body = await readBody(event);

  const {
    cart
  } = body;

  const [error, user] = await safeAwait(User.updateOne({ email: session.user.email }, { cart }));
  if(error) {
    logger.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Server Error Getting User'
    });
  }
});
