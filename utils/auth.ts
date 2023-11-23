export const isLoggedIn = () : boolean => {
  const { status } = useAuth();
  return status.value === 'authenticated';
}
