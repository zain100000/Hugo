/**
 * Validation utility functions for signup/signin
 * Supports userName, email, password, and gender validations
 */

export const validateUserName = userName => {
  if (!userName) {
    return 'Name is required';
  }
  if (userName.length < 3) {
    return 'Name must be at least 3 characters long';
  }
  return '';
};

export const validateEmail = email => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return 'Email is required';
  }
  if (!emailPattern.test(email)) {
    return 'Please enter a valid email address';
  }
  return '';
};

export const validatePassword = password => {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters long';
  }
  return '';
};

export const validateGender = gender => {
  if (!gender) {
    return 'Gender is required';
  }
  return '';
};

export const validateFields = fields => {
  const validationFunctions = {
    userName: validateUserName,
    email: validateEmail,
    password: validatePassword,
    gender: validateGender,
  };

  const errors = {};
  Object.keys(fields).forEach(field => {
    if (validationFunctions[field]) {
      const error = validationFunctions[field](fields[field]);
      if (error) {
        errors[field] = error;
      }
    }
  });

  return errors;
};

export const isValidInput = fields => {
  const errors = validateFields(fields);
  return Object.values(errors).every(error => error === '');
};
