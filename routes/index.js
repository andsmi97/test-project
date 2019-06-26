const router = require("koa-router")();
const booksController = require("../controllers/books");

router.get("/select", booksController.select);
router.post("/insert", booksController.insert);
router.put("/update", booksController.update);

module.exports = router;
