const isEmail = (email) => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) return true;
  else return false;
};

const isUSZipCode = (zip) => {
  const regEx = /(^\d{5}$)|(^\d{5}-\d{4}$)/;
  if (zip.match(regEx)) return true;
  else return false;
};

const isEmpty = (string) => {
  if (string.trim() === "") return true;
  else return false;
};

exports.validateEventData = (data) => {
  let errors = {};

  if (isEmpty(data.body)) errors.body = "Must not be empty";
  if (isEmpty(data.dateTime)) errors.dateTime = "Must not be empty";
  if (isEmpty(data.address)) errors.address = "Must not be empty";
  if (isEmpty(data.startingLocation))
    errors.startingLocation = "Must not be empty";

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
  };
};

exports.validateSignupData = (data) => {
  let errors = {};

  if (isEmpty(data.email)) {
    errors.email = "Must not be empty";
  } else if (!isEmail(data.email)) {
    errors.email = "Must be a valid email address";
  }

  if (isEmpty(data.password)) errors.password = "Must not be empty";
  if (data.password !== data.confirmPassword)
    errors.confirmPassword = "Passwords must match";
  if (isEmpty(data.username)) errors.username = "Must not be empty";

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
  };
};

exports.validateLoginData = (data) => {
  let errors = {};

  if (isEmpty(data.email)) errors.email = "Must not be empty";
  if (isEmpty(data.password)) errors.password = "Must not be empty";

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
  };
};

exports.reduceUserDetails = (data) => {
  // validation for user profile details
  let userDetails = {};
  let errors = {};

  if (!isEmpty(data.bio.trim())) userDetails.bio = data.bio;
  if (!isUSZipCode(data.zipCode)) {
    errors.zipCode = "Must be valid US zip code";
  } else {
    userDetails.zipCode = data.zipCode;
  }

  return {
    errors,
    userDetails,
  };
};
