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
    return { status: 500, error: 'There was an error' };
  }

  if(users?.length) {
    return { status: 400, error: 'Email Already Exists' };
  }

  const hash = hashPassword(password);

  const [error] = await safeAwait(User.create({
    email,
    hash,
    phone,
    name
  }));

  if(error) {
    logger.error(error);
    return { status: 500, error: 'There was an error' };
  }

  return { status: 200 };
});
