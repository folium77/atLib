const express = require('express');
const app = express();
const ejs = require('ejs');
const func = require('./function.js');
app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');

app.get('/', (req, res) => {

  func.selectDb(res);

});

app.get('/post', (req, res) => {

  const isbn = req.query.isbn;

  func.getBookInfo(isbn)
    .then((result) => {
      return func.getBookNDC(isbn, result);
    })
    .then((result) => {
      func.insertDb(result);
    })
    .then(() => {
      res.redirect(req.baseUrl + '/');
    })
    .catch((err) => {
      console.log('通信エラーです');
    });

});

app.listen(3000);
console.log('Server running at http://localhost:3000/');