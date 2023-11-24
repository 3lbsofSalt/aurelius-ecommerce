import bcrypt from 'bcryptjs';

export const isLoggedIn = () : boolean => {
  const { status } = useAuth();
  return status.value === 'authenticated';
}

export const hashPassword = (value : string) : string => {
  return bcrypt.hashSync(value, 10);
}
