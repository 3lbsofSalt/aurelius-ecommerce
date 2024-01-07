export const requiredAlphaNumericRules = [
  (v: string) => !!v || 'This field is required',
  (v: string) => isAlphanumeric(v) || 'Field can only have numbers, letters, spaces, !\'s, ?\'s, and underscores.'
]

export const alphaNumericRules = [
  (v: string) => !v || isAlphanumeric(v) || 'Field can only have numbers, letters, spaces, !\'s, ?\'s, and underscores.'
]

export const wideRangeAlphaNumericRules = [
  (v: string) => !v || isWideRangeAlphanumeric(v) || 'Field can only have numbers, letters, spaces, !\'s, ?\'s, and underscores.'
]

export const requiredWideRangeAlphaNumericRules = [
  (v: string) => !!v || 'This field is required',
  (v: string) => !v || isWideRangeAlphanumeric(v) || 'Field can only have numbers, letters, spaces, -\'s, \/, !\'s, ?\'s, underscores, and line breaks.'
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
  (v: string) => !v || isCurrency(v) || 'Currency must be valid and positive. If it is a cent amount, lead it with a 0 like: 0.69'
];

export const currencyRules = [
  (v: string) => !v || isCurrency(v) || 'Currency must be valid and positive. If it is a cent amount, lead it with a 0 like: 0.69'
];

export const positiveIntegerRules = [
  (v: string) => !v || isPositiveInteger(v) || 'Must be a positive integer (cannot be 0)'
]

export const requiredPositiveIntegerRules = [
  (v: string) => !!v || 'This field is required',
  (v: string) => !v || isPositiveInteger(v) || 'Must be a positive integer (cannot be 0)'
]

export const positiveNumberRules = [
  (v: string) => !v || isPositiveNumber(v) || 'Must be a positive integer (cannot be 0)'
]

export const requiredPositiveNumberRules = [
  (v: string) => !!v || 'This field is required',
  (v: string) => !v || isPositiveNumber(v) || 'Must be a positive integer (cannot be 0)'
]

export const positiveDecimalLessThanOneRules = [
  (v: string) => !v || isPositiveDecimalLessThanOne(v) || 'Must be a positive decimal to two places that is less than one (can be 0)'
]

export const isAlphanumeric = (input : string) : boolean => {
  return /^[a-zA-Z0-9_ !\?\.]+$/.test(input);
}

export const isWideRangeAlphanumeric = (input : string) : boolean => {
  return /^[a-zA-Z0-9_ ,'!\?\.(\r\n|\r|\n)\-\+\=\/\&]*$/.test(input);
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

export const isPositiveInteger = (input : string) : boolean => {
  return /^0*[1-9]+\d*$/.test(input);
}

export const isPositiveNumber = (input : string) : boolean => {
  return !isNaN(input) && parseFloat(input) > 0;
}

export const isPositiveDecimalLessThanOne = (input : string) : boolean => {
  return /^0?\.\d{0,2}$/.test(input);
}
