// File: schemaValidation.js
// Description: Validates a submitted object against a predefined schema.

const validator = require("validator");
const {Type} = require("./type");

// Validates an object against a provided schema.
//
// Returns an empty string (a falsy value) if the object is valid to the schema.
// Otherwise, returns a non-empty string (a truthy value) specifying the
// validation error message.
//
// Note:
// - An object can have properties that are not in the schema and can still be
//   valid.
//
// - Extra properties not in schema are ignored and are not included in the
//   sanitized object.
//
// - For partial objects (e.g. usually those come from PATCH requests), not all
//   properties are provided. In these cases, this function ignores keys not in
//   the schema and only validates the rest.
function getSchemaViolations(obj, schema, isPartialObj = false) {
  // return an error string if the input is not an object
  if (obj !== Object(obj)) {
    return "Constraint violated: Invalid input type\n\n";
  }

  // return an error string if object doesn't have matching keys with schema
  if (Object.keys(obj).every(key => !(key in schema))) {
    return "Constraint violated: Input has no matching key with schema\n\n";
  }

  // at this point, it is guaranteed that the object has some matching keys with
  // the schema and possibly some keys that are not in the schema
  let errorMessage = "";

  if (isPartialObj) {
    // partial-object case: for every property in the object
    Object.keys(obj).forEach(key => {
      // validate if property is in schema, otherwise ignore it
      if (hasProperty(schema, key)) {
        // append an error message if any or an empty string if no error
        errorMessage += getPropertyViolation(obj, key, schema);
      }
    });
  } else {
    // strict-object case: for every property in the schema
    Object.keys(schema).forEach(key => {
      // validate if property is required by schema, otherwise ignore it
      if (schema[key].required) {
        errorMessage += getPropertyViolation(obj, key, schema);
      }
    });
  }

  // final result is still an empty string if there's no schema violation,
  // otherwise it contains validation error messages separated by newlines
  return errorMessage;
}
exports.getSchemaViolations = getSchemaViolations;

// Validates a single property of an object against a provided schema.
//
// Returns an empty string (a falsy value) if the property is valid to the
// schema. Otherwise, returns a non-empty string (a truthy value) specifying the
// validation error message.
//
// Preconditions:
// - Requires the property to be already in the schema.
function getPropertyViolation(obj, property, schema) {
  // if property is not in the schema, return an error string
  // (this should never happen)
  if (!hasProperty(schema, property)) {
    return `Constraint violated: Property "${property}" not in schema\n\n`;
  }

  // if object does not have the property at all, return an error string
  if (!hasProperty(obj, property)) {
    return `Constraint violated: Property "${property}" not in input\n\n`;
  }

  // at this point, it is guaranteed that both object and schema have a matching
  // property
  let isValid;

  // validate the property based on its type
  switch (schema[property].type) {
    case Type.integer:
      isValid = validator.isInt(obj[property] + "", {
        min: schema[property].minValue,
        max: schema[property].maxValue
      });
      break;

    case Type.string:
      isValid = validator.isLength(obj[property] + "", {
        min: schema[property].minLength,
        max: schema[property].maxLength
      });
      break;

    case Type.timestamp:
      // time format must be ISO 8601, e.g. "2020-12-31T23:59:59Z"
      isValid = validator.isISO8601(obj[property] + "", {
        strict: true
      });
      break;

    // if property is not of the allowed types, it's not valid
    default:
      isValid = false;
      break;
  }

  // return an empty string if pass the validator or return a non-empty error
  // string otherwise
  return isValid ? "" : (schema[property].getErrorMessage() + "\n\n");
}

// Sanitizes an object using a provided schema by extracting valid properties to
// a new object and returns that object.
//
// Note:
// - This function assumes the object has been validated against the schema.
// - This function does not support nested objects or with arrays inside.
function sanitizeUsingSchema(obj, schema) {
  const validObj = {};
  if (obj) {
    // since this function assumes the object has been validated against the
    // schema, a property is valid if it is in the schema
    Object.keys(schema).forEach(key => {
      if (hasProperty(obj, key)) {
        validObj[key] = obj[key];
      }
    });
  }
  return validObj;
}
exports.sanitizeUsingSchema = sanitizeUsingSchema;

// Schema of an applied Plan used for the validator and the database.
const planSchema = {
  status: {
    required: false,
    type: Type.integer,
    minValue: 0,
    maxValue: 4,
    getErrorMessage: function() {
      return "Constraint violated: Invalid plan status\n" +
        "Plan status must be 0 (Rejected), 1 (Awaiting Student Changes) " +
        "2 (Awaiting Reivew), 3 (Awaiting Final Review), or 4 (Accepted).";
    }
  },
  planName: {
    required: true,
    type: Type.string,
    minLength: 5,
    maxLength: 50,
    getErrorMessage: function() {
      return "Constraint violated: Invalid plan name\n" +
        `The plan name must be a string between ${this.minLength} and ` +
        `${this.maxLength} characters long.`;
    }
  },
  studentId: {
    required: true,
    type: Type.integer,
    minValue: 1,
    maxValue: Infinity,
    getErrorMessage: function() {
      return "Constraint violated: Invalid user ID\n" +
        "The user ID associated with this plan must be an integer at least " +
        `${this.minValue}.`;
    }
  },
  lastUpdated: {
    required: false,
    type: Type.timestamp,
    getErrorMessage: function() {
      return "Constraint violated: Invalid plan timestamp\n" +
        "The plan timestamp must be in ISO 8601 format.";
    }
  }
};
exports.planSchema = planSchema;

// A shorthand to check whether an object has a property that is
// neither `null` nor `undefined`.
function hasProperty(obj, property) {
  return obj && obj[property] !== null && obj[property] !== undefined;
}
