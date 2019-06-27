const validator = require("../validators");
const NodeCache = require("node-cache");
const db = require("knex")({
  client: "mysql",
  connection: {
    host: "mysql",
    user: "root",
    password: "myUserPass",
    database: "library"
  }
});

//1 hour ttl for cache
const ttl = 60 * 60 * 1;
const myCache = new NodeCache(ttl);

/*
  request exapmle:
  url/insert?table=books
  {
    "title": "Анна Каренина",
    "author_id": 1,
    "description":"Рроман Льва Толстого о трагической любви замужней дамы Анны Карениной и блестящего офицера Вронского на фоне счастливой семейной жизни дворян Константина Лёвина и Кити Щербацкой. Масштабная картина нравов и быта дворянской среды Петербурга и Москвы второй половины XIX века",
    "date":"1873-01-01",
    "image":"http://lorempixel.com/200/400/"
  } table
 
  response example:
  201 OK
 */
const insert = async ctx => {
  try {
    // inserting fields into specified table
    const { table } = ctx.request.query;
    const { ...fields } = ctx.request.body;
    //sanitize fields
    const sanitizedFields = validator.sanitizeFields(fields);
    //validating errors
    const errors = validator.insertValidation(table, sanitizedFields);
    if (errors === undefined || errors.length > 0) {
      ctx.response.status = 400;
      ctx.response.body = errors;
      return;
    }

    await db(table).insert(sanitizedFields);
    ctx.response.status = 201;
  } catch (e) {
    //if error send 400 status and log error;
    console.error(e);
    ctx.response.status = 400;
  }
};

/*
  request exapmle:
  url/update?id=1&table=books
  {
    "title": "Война и мир",
    "author": 1,
    "description":"Роман-эпопея Льва Николаевича Толстого, описывающий русское общество в эпоху войн против Наполеона в 1805—1812 годах.",
    "date":"1965-01-01",
    "image":"http://lorempixel.com/200/400/"
  }

  response example:
  204 OK
 */
const update = async ctx => {
  try {
    // updating specific record on table
    // fields is an object where keys are the column names
    // it is NOT required to specify every column to update record
    const { ...fields } = ctx.request.body;
    const { id, table } = ctx.request.query;
    const sanitizedFields = validator.sanitizeFields(fields);

    const errors = validator.updateValidation(table, id, sanitizedFields);
    if (errors === undefined || errors.length > 0) {
      ctx.response.status = 400;
      ctx.response.body = errors;
      return;
    }
    await db(table)
      .where({ id })
      .update(sanitizedFields);
    ctx.response.status = 200;
  } catch (e) {
    //if error send 400 status and log error;
    console.error(e);
    ctx.response.status = 400;
  }
};

/*
  reqest example:
  url/select?limit=1&offset=10&order=[{"column":"id", "order":"desc"}]&filter={"image":"http://lorempixel.com/200/400/"}

  reponse example
  200
  [
      {
          "id": 99990,
          "title": "Veniam exercitationem maxime quia quia iste.",
          "description": "Laudantium veniam quisquam et fuga. Aut est qui et eveniet dolorem quod distinctio. Vitae beatae id vel vero quod animi labore.",
          "image": "http://lorempixel.com/200/400/",
          "date": "2003-01-03T00:00:00.000Z",
          "author_id": 99990,
          "first_name": "Vivian",
          "last_name": "Tillman"
      }
  ]
*/
const select = async ctx => {
  try {
    let { limit, offset, order, filter } = ctx.request.query;
    //probably should sanitize since data is not going into db
    //and escaping is done by default via knex
    const errors = validator.selectValidation(limit, offset, order, filter);
    if (errors === undefined || errors.length > 0) {
      ctx.response.status = 400;
      ctx.response.body = errors;
      return;
    }

    /*
      had to specify select fields directly due to ambiguous id naming
      this fields can be also parameterized if necessary

      from clause can be changed to table parameter if necessary

      filtration is simple json object with {column:value} notation

      order is simple json array with objects inside [{column, order}]

      limit and offset are integers
      
      more detail at https://knexjs.org/
    */
    const cached = myCache.get(JSON.stringify(ctx.request.query));
    //if cached value exists return cache
    if (cached !== undefined) {
      ctx.response.body = cached;
    } else {
      //else make db reqest, cache it for 1 hour
      let sqlQuery = db
        .select([
          "books.id",
          "title",
          "description",
          "image",
          "date",
          "author_id",
          "first_name",
          "last_name"
        ])
        .from("books")
        .innerJoin("authors", "authors.id", "books.author_id");
      //adding used params to sql query
      if (filter) {
        sqlQuery.where(JSON.parse(filter));
      }
      if (order) {
        sqlQuery.orderBy(JSON.parse(order));
      }
      if (limit) {
        sqlQuery.limit(Number(limit));
      }
      if (offset) {
        sqlQuery.offset(Number(offset));
      }
      let selected = await sqlQuery;
      //cache key is query string so query order does matter
      myCache.set(JSON.stringify(ctx.request.query), selected);
      ctx.response.body = selected;
    }
  } catch (e) {
    //if error send 400 status and log error;
    console.error(e);
    ctx.response.status = 400;
  }
};

module.exports = {
  insert,
  update,
  select
};
