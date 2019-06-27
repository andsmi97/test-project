const db = require("knex")({
  client: "mysql",
  connection: {
    host: "mysql",
    user: "root",
    password: "myUserPass",
    database: "library"
  }
});
const NodeCache = require("node-cache");
const myCache = new NodeCache();

/*
  request exapmle:
  url/insert?table=books
  {
    "title": "Анна Каренина",
    "author_id": 1,
    "description":"Рроман Льва Толстого о трагической любви замужней дамы Анны Карениной и блестящего офицера Вронского на фоне счастливой семейной жизни дворян Константина Лёвина и Кити Щербацкой. Масштабная картина нравов и быта дворянской среды Петербурга и Москвы второй половины XIX века",
    "date":"1873-01-01",
    "image":"http://lorempixel.com/200/400/"
  }
 
  response example:
  201 OK
 */
const insert = async ctx => {
  try {
    // inserting fields into specified table

    const { table } = ctx.request.query;
    const { ...fields } = ctx.request.body;
    await db(table).insert(fields);
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
    await db(table)
      .where({ id })
      .update(fields);
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
    const { limit, offset, order, filter } = ctx.request.query;

    /*
        had to specify select fields directly due to ambiguous id naming
        this fields can be also parameterized if necessary

        from clause can be changed to table parameter if necessary

        filtration is simple json object with {field:value} notation

        order is simple json array with objects inside [{field, order}]

        limit and offset are integers
        
        more detail at https://knexjs.org/
      */

    const cached = myCache.get(JSON.stringify(ctx.request.query));
    //if cached value exists return cache
    if (cached !== undefined) {
      ctx.response.body = cached;
    } else {
      //else make db reqest, cache it for 1 hour
      const selected = await db
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
        .innerJoin("authors", "authors.id", "books.author_id")
        .where(JSON.parse(filter))
        .orderBy(JSON.parse(order))
        .limit(Number(limit))
        .offset(Number(offset));
      //cache key is query string so query order does matter
      myCache.set(JSON.stringify(ctx.request.query), selected, 60 * 60 * 1);
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
