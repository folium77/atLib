const express = require('express');
const app = express();
const ejs = require('ejs');
const func = require('./function.js');

app.use(express.static('public'));
app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');

app.get('/', (req, res) => {

  func.selectDb(req, res);

});

app.get('/post', (req, res) => {

  const isbn = req.query.isbn;

  func.getBookInfo(isbn)
    .then((result,reee) => {
      if (result[0]) {
        return func.getBookNDC(isbn, result);
      }
    })
    .then((result) => {
      if (result) {
        func.insertDb(result);
        res.redirect(req.baseUrl + '/');
      } else {
        res.redirect(req.baseUrl + '/');
      }
    })
    .then(() => {

    })
    .catch((err) => {
      console.log('通信エラーです');
    });

});

app.listen(3000);
console.log('Server running at http://localhost:3000/');