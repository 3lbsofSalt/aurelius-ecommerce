export const alphaNumericRules = [
  (v: string) => isAlphanumeric(v) || 'Field can only have numbers, letters, spaces, !\'s, ?\'s, and underscores.'
]

export const emailRules = [
  (v: string) => !!v || 'Email is required',
  (v: string) => isEmail(v) || 'Email must be valid'
];

export const passwordRules = [
  (v: string) => !!v || 'Password is required',
  (v: string) => isValidPassword(v) ||
  'Password must be at least 8 characters long and have at least one capital, lowercase, number, and special character.'
];

export const phoneNumberRules = [
  (v: string) => !!v || isPhoneNumber(v) || 'The phone number must either be empty or valid.'
];

export const requiredCurrencyRules = [
  (v: string) => !!v || 'Currency is required',
  (v: string) => isCurrency(v) || 'Currency must be valid and positive'
];

export const isAlphanumeric = (input : string) : boolean => {
  return /^[a-zA-Z0-9_ !\?]+$/.test(input);
}

export const isEmail = (input :string) : boolean => {
  return /.+@.+\..+/.test(input);
}

export const isValidPassword = (input : string) : boolean => {
  return /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+=-])(?=\S+$).{8,}$/.test(input);
}

export const isPhoneNumber = (input : string) : boolean => {
  return /^(1\s?)?(\d{3}|\(\d{3}\))[\s\-]?\d{3}[\s\-]?\d{4}$/.test(input);
}

export const isCurrency = (input : string) : boolean => {
  return /(?:^[1-9]([0-9]+)?(?:\.[0-9]{1,2})?$)|(?:^(?:0)$)|(?:^[0-9]\.[0-9](?:[0-9])?$)/.test(input);
}

