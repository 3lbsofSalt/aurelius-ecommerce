import { hashPassword } from '~/utils/auth';
import User from '../models/User';
import safeAwait from 'safe-await';

export default defineEventHandler(async (event) => {
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
    console.log(getError);
    return { status: 500, error: 'There was an error' };
  }

  if(users?.length) {
    return { status: 400, error: 'Email Already Exists' };
  }

  console.log(password);
  const hash = hashPassword(password);
  console.log(hash);

  const [error] = await safeAwait(User.create({
    email,
    hash,
    phone,
    name
  }));

  if(error) {
    console.log(error);
    return { status: 500, error: 'There was an error' };
  }

  return { status: 200 };
});
