const constraints = require("./constraints");
module.exports = {
  TABLE: {
    type: "table error",
    msg: `Table should be in [${constraints.TABLES}]`
  },
  TITLE: {
    type: "title error",
    msg: `Title should be less than 255 characters`
  },
  AUTHOR_ID: {
    type: "author_id error",
    msg: `Author_id should be positive integer value`
  },
  DESCRIPTION: {
    type: "description error",
    msg: `Description should be less than 500 characters`
  },
  IMAGE: {
    type: "image error",
    msg: `image link should be less than 50 characters`
  },
  DATE: {
    type: "date error",
    msg: `Date should be vaild ISO8601 date`
  },
  FIRSTNAME: {
    type: "first_name error",
    msg: `first_name should be less than 50 characters`
  },
  LASTNAME: {
    type: "last_name error",
    msg: `last_name should be less than 50 characters`
  },
  ID: {
    type: "ID error",
    msg: `ID should be positive intger`
  },
  LIMIT: {
    type: "limit error",
    msg: `limit should be positive intger`
  },
  OFFSET: {
    type: "offset error",
    msg: `offset should be positive intger`
  },
  FILTER: {
    type: "filter error",
    msg: `filter should be valid JSON and should containt object {column:value}`
  },
  ORDER: {
    type: "order error",
    msg: `order should be valid JSON and should contain array with objects {column,order} `
  },
  BOOKCOLUMNS: {
    type: "bookcolumns error",
    msg: `book fields should be in ${constraints.BOOKS} `
  },
  AUTHORCOLUMNS: {
    type: "authorcolumns error",
    msg: `book fields should be in ${constraints.AUTHORS} `
  }
};
