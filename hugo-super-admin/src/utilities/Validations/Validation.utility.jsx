/**
 * Validation Utilities
 *
 * Provides reusable validation functions for authentication and coin packages.
 * Features:
 * - Email validation
 * - Password validation
 * - Coin package validations (name, coins, price, currency, duration)
 * - Unified validation function to check multiple fields at once
 * - Utility to determine overall form validity
 */

/**
 * Validate email format.
 * @param {string} email - The user's email address.
 * @returns {string} Error message or empty string if valid.
 */
export const validateEmail = (email) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return "Email is required";
  }
  if (!emailPattern.test(email)) {
    return "Please enter a valid email address";
  }
  return "";
};

/**
 * Validate password strength.
 * @param {string} password - The user's password.
 * @returns {string} Error message or empty string if valid.
 */
export const validatePassword = (password) => {
  if (!password) {
    return "Password is required";
  }
  if (password.length < 4) {
    return "Password must be at least 4 characters long";
  }
  return "";
};

/**
 * Validate package name.
 * @param {string} name - The package name.
 * @returns {string} Error message or empty string if valid.
 */
export const validatePackageName = (name) => {
  if (!name) {
    return "Package name is required";
  }
  if (name.length < 2) {
    return "Package name must be at least 2 characters long";
  }
  if (name.length > 50) {
    return "Package name must be less than 50 characters";
  }
  return "";
};

/**
 * Validate coins amount.
 * @param {string|number} coins - The number of coins.
 * @returns {string} Error message or empty string if valid.
 */
export const validateCoins = (coins) => {
  if (!coins && coins !== 0) {
    return "Coins amount is required";
  }
  const coinsNum = Number(coins);
  if (isNaN(coinsNum)) {
    return "Coins must be a valid number";
  }
  if (coinsNum <= 0) {
    return "Coins must be greater than 0";
  }
  if (coinsNum > 1000000) {
    return "Coins amount is too high";
  }
  return "";
};

/**
 * Validate package price.
 * @param {string|number} price - The package price.
 * @returns {string} Error message or empty string if valid.
 */
export const validatePrice = (price) => {
  if (!price && price !== 0) {
    return "Price is required";
  }
  const priceNum = Number(price);
  if (isNaN(priceNum)) {
    return "Price must be a valid number";
  }
  if (priceNum <= 0) {
    return "Price must be greater than 0";
  }
  if (priceNum > 1000000) {
    return "Price is too high";
  }
  return "";
};

/**
 * Validate currency.
 * @param {string} currency - The currency type.
 * @returns {string} Error message or empty string if valid.
 */
export const validateCurrency = (currency) => {
  const validCurrencies = ["PKR", "USD", "EUR", "GBP"];
  if (!currency) {
    return "Currency is required";
  }
  if (!validCurrencies.includes(currency.toUpperCase())) {
    return "Please select a valid currency";
  }
  return "";
};

/**
 * Validate duration value.
 * @param {string|number} durationValue - The duration value.
 * @returns {string} Error message or empty string if valid.
 */
export const validateDurationValue = (durationValue) => {
  if (!durationValue && durationValue !== 0) {
    return "Duration value is required";
  }
  const durationNum = Number(durationValue);
  if (isNaN(durationNum)) {
    return "Duration value must be a valid number";
  }
  if (durationNum <= 0) {
    return "Duration value must be greater than 0";
  }
  if (durationNum > 365) {
    return "Duration value is too high";
  }
  return "";
};

/**
 * Validate duration unit.
 * @param {string} durationUnit - The duration unit.
 * @returns {string} Error message or empty string if valid.
 */
export const validateDurationUnit = (durationUnit) => {
  const validUnits = ["day", "week", "month", "year"];
  if (!durationUnit) {
    return "Duration unit is required";
  }
  if (!validUnits.includes(durationUnit)) {
    return "Please select a valid duration unit";
  }
  return "";
};

/**
 * Validate multiple fields at once using the appropriate validation function.
 * @param {Object} fields - Object containing field names and values.
 * @returns {Object} Errors keyed by field name.
 */
export const validateFields = (fields) => {
  const validationFunctions = {
    email: validateEmail,
    password: validatePassword,
    name: validatePackageName,
    packageName: validatePackageName,
    coins: validateCoins,
    price: validatePrice,
    currency: validateCurrency,
    durationValue: validateDurationValue,
    durationUnit: validateDurationUnit,
  };

  const errors = {};

  Object.keys(fields).forEach((field) => {
    if (validationFunctions[field]) {
      const error = validationFunctions[field](fields[field]);
      if (error) {
        errors[field] = error;
      }
    }
  });

  return errors;
};

/**
 * Determine if all inputs in a form are valid.
 * @param {Object} fields - Object containing field names and values.
 * @returns {boolean} True if all fields are valid, false otherwise.
 */
export const isValidInput = (fields) => {
  console.log("Validating fields: ", fields);
  const errors = validateFields(fields);
  console.log("Validation errors: ", errors);
  return Object.keys(errors).length === 0;
};
