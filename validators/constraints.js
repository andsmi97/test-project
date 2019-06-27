//obviously tables and columns could be selected from db
module.exports = {
  POSITIVEINT: { gt: 0 },
  VARCHAR255: { min: 1, max: 255 },
  VARCHAR500: { min: 1, max: 500 },
  VARCHAR50: { min: 1, max: 50 },
  TABLES: ["authors", "books"],
  BOOKS: ["title", "author_id", "description", "date", "image"],
  AUTHORS: ["first_name", "last_name"]
};
