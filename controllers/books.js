/* 
  request exapmle:
  url/insert
  {
    "title": "Война и мир",
    "author": 1,
    "description":"Роман-эпопея Льва Николаевича Толстого, описывающий русское общество в эпоху войн против Наполеона в 1805—1812 годах."
    "date":"1965-01-01",
    "image":"http://lorempixel.com/200/400/"
  }

  response example:
  201 OK
*/
const insert = async ctx => {
  const { title, author, description, date, image } = ctx.request.body;

  ctx.response.status = 201;
};

/* 
  request exapmle:
  url/update?id=1
  {
    "title": "Война и мир",
    "author": 1,
    "description":"Роман-эпопея Льва Николаевича Толстого, описывающий русское общество в эпоху войн против Наполеона в 1805—1812 годах."
    "date":"1965-01-01",
    "image":"http://lorempixel.com/200/400/"
  }

  response example:
  204 OK
*/
const update = async ctx => {
  const { title, author, description, date, image } = ctx.request.body;
  const { id } = ctx.request.query;
  ctx.response.status = 201;
};

/*
  reqest example:
  url/select?limit=11&offset=0&order=title&sort=asc&author=1

  reponse example
  200
  [
    {
      "id": 1,
      "title": "Война и мир",
      "author": 1,
      "description":"Роман-эпопея Льва Николаевича Толстого, описывающий русское общество в эпоху войн против Наполеона в 1805—1812 годах."
      "date":"1965-01-01",
      "image":"http://lorempixel.com/200/400/"
    }
  ]
*/
const select = async ctx => {
  const {
    limit,
    offset,
    order,
    sort,
    title,
    author,
    description,
    date,
    image
  } = ctx.request.query;

  ctx.response.status = 200;
};

module.exports = {
  insert,
  update,
  select
};
