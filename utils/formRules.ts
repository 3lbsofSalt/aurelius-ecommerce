export const emailRules = [
  (v: string) => !!v || 'Email is required',
  (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid'
];

export const passwordRules = [
  (v: string) => !!v || 'Password is required',
  (v: string) => /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+=-])(?=\S+$).{8,}$/.test(v) ||
  'Password must be at least 8 characters long and have at least one capital, lowercase, number, and special character.'
];


