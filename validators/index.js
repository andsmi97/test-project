const validator = require("validator");
const ERRORTYPES = require("./errortypes");
const constraints = require("./constraints");
const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");

const isFieldsInTable = (fields, table) =>
  Object.keys(fields).reduce((acc, field) => {
    if (!validator.isIn(field, constraints[table])) {
      acc = true;
    }
    return acc;
  }, false);

/**
 * @description validating fields on insert request
 * @param {string} table
 * @param {object} fields
 * @returns {object} Array of errors or empty array if none;
 */
const insertValidation = (table, fields) => {
  let errors = [];
  if (!table || !validator.isIn(table, constraints.TABLES)) {
    return [ERRORTYPES.TABLE];
  }
  switch (table) {
    case "books":
      //validating title

      if (isFieldsInTable(fields, "BOOKS")) {
        errors.push(ERRORTYPES.BOOKCOLUMNS);
      }
      if (
        !fields.title ||
        !validator.isLength(fields.title, constraints.VARCHAR255)
      ) {
        errors.push(ERRORTYPES.TITLE);
      }
      //validating author_id to be positive int
      //can be extended to check if author id is in authors ids range
      if (
        !fields.author_id ||
        !validator.isInt(String(fields.author_id), constraints.POSITIVEINT)
      ) {
        errors.push(ERRORTYPES.AUTHOR_ID);
      }
      //description validation
      if (
        !fields.description ||
        !validator.isLength(fields.description, constraints.VARCHAR500)
      ) {
        errors.push(ERRORTYPES.DESCRIPTION);
      }
      //image link validation
      if (
        !fields.image ||
        !validator.isLength(fields.image, constraints.VARCHAR50)
      ) {
        errors.push(ERRORTYPES.IMAGE);
      }
      //date validation
      if (!fields.date || !validator.isISO8601(fields.date)) {
        errors.push(ERRORTYPES.DATE);
      }
      return errors;
    case "authors":
      if (isFieldsInTable(fields, "AUTHORS")) {
        errors.push(ERRORTYPES.AUTHORCOLUMNS);
      }
      //validating first name
      if (
        !fields.first_name ||
        !validator.isLength(fields.first_name, constraints.VARCHAR50)
      ) {
        errors.push(ERRORTYPES.FIRSTNAME);
      }
      //validating last name
      if (
        !fields.last_name ||
        !validator.isLength(fields.last_name, constraints.VARCHAR50)
      ) {
        errors.push(ERRORTYPES.LASTNAME);
      }
    default:
      return errors;
  }
};

/**
 * @description validating fields on update request
 * @param {string} table
 * @param {number} id
 * @param {object} fields
 * @returns {object} Array of errors or empty array if none;
 */
const updateValidation = (table, id, fields) => {
  let errors = [];
  //validating table
  if (!table || !validator.isIn(table, constraints.TABLES)) {
    return [ERRORTYPES.TABLE];
  }
  //validating id to be positive int
  if (!id || !validator.isInt(String(id), constraints.POSITIVEINT)) {
    errors.push(ERRORTYPES.ID);
  }
  switch (table) {
    case "books":
      if (isFieldsInTable(fields, "BOOKS")) {
        errors.push(ERRORTYPES.BOOKCOLUMNS);
      }
      //validating title
      if (
        fields.hasOwnProperty("title") &&
        !validator.isLength(fields.title, constraints.VARCHAR255)
      ) {
        errors.push(ERRORTYPES.TITLE);
      }
      //validating author_id to be positive int
      //can be extended to check if author id is in authors ids range
      if (
        fields.hasOwnProperty("author_id") &&
        !validator.isInt(String(fields.author_id), constraints.POSITIVEINT)
      ) {
        errors.push(ERRORTYPES.AUTHOR_ID);
      }
      //description validation
      if (
        fields.hasOwnProperty("description") &&
        !validator.isLength(fields.description, constraints.VARCHAR500)
      ) {
        errors.push(ERRORTYPES.DESCRIPTION);
      }
      //image link validation
      if (
        fields.hasOwnProperty("image") &&
        !validator.isLength(fields.image, constraints.VARCHAR50)
      ) {
        errors.push(ERRORTYPES.IMAGE);
      }
      //date validation
      if (fields.hasOwnProperty("date") && !validator.isISO8601(fields.date)) {
        errors.push(ERRORTYPES.DATE);
      }
      return errors;
    case "authors":
      if (isFieldsInTable(fields, "AUTHORS")) {
        errors.push(ERRORTYPES.AUTHORCOLUMNS);
      }
      //validating first name
      if (
        fields.hasOwnProperty("first_name") &&
        !validator.isLength(fields.first_name, constraints.VARCHAR50)
      ) {
        errors.push(ERRORTYPES.FIRSTNAME);
      }
      //validating last name
      if (
        fields.hasOwnProperty("last_name") &&
        !validator.isLength(fields.last_name, constraints.VARCHAR50)
      ) {
        errors.push(ERRORTYPES.LASTNAME);
      }
    default:
      return errors;
  }
};

/**
 * @description validating fields on select request
 * @param {number} limit
 * @param {number} offset
 * @param {object} order
 * @param {object} filter
 * @returns {object} Array of errors or empty array if none;
 */
const selectValidation = (limit, offset, order, filter) => {
  let errors = [];
  if (
    limit &&
    limit !== "" &&
    !validator.isInt(String(limit), constraints.POSITIVEINT)
  ) {
    errors.push(ERRORTYPES.LIMIT);
  }
  if (
    offset &&
    offset !== "" &&
    !validator.isInt(String(offset), constraints.POSITIVEINT)
  ) {
    errors.push(ERRORTYPES.OFFSET);
  }
  if (order && order !== "" && !validator.isJSON(order)) {
    errors.push(ERRORTYPES.ORDER);
  }
  if (filter && filter !== "" && !validator.isJSON(filter)) {
    errors.push(ERRORTYPES.FILTER);
  }

  return errors;
};

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

/**
 * @description function sanitizes given object fields triming them and parsing to strings
 * @param {Object} fields
 * @returns {Object}
 */
const sanitizeFields = fields => {
  const sanitizedFields = {};
  //triming each field values
  //not using esaping vs SQL injection since knex do it by default
  //using DOMPurify vs XSS
  Object.keys(fields).forEach(field => {
    sanitizedFields[field] = DOMPurify.sanitize(
      validator.trim(String(fields[field]))
    );
  });
  return sanitizedFields;
};

module.exports = {
  sanitizeFields,
  insertValidation,
  updateValidation,
  selectValidation
};
