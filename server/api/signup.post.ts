import { hashPassword } from '~/utils/auth';
import User from '../models/User';
import safeAwait from 'safe-await';
import { useLogger } from '@nuxt/kit';

export default defineEventHandler(async (event) => {
  const logger = useLogger();
  const body = await readBody(event);
  const {
    email,
    password,
    phone = '',
    name = ''
  } = body;

  const [getError, users] = await safeAwait(User.find({
    email
  }));

  if(getError) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Server error'
    });
  }

  if(users?.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'The email already exists'
    });
  }

  const hash = hashPassword(password);

  const [error] = await safeAwait(User.create({
    email,
    hash,
    phone,
    name
  }));

  console.log('error here')

  if(error) {
    logger.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Server Error'
    });
  }
});
