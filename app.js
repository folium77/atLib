const express = require('express');
const app = express();
//const ejs = require('ejs');
const func = require('./function.js');

// app.set('views', `${__dirname}/views`);
// app.set('view engine', 'ejs');

const reactViews = require('express-react-views');
const options = { beautify: true };
app.set('views', `${__dirname}/views`);
app.set('view engine', 'jsx');
app.engine('jsx', reactViews.createEngine(options));

app.use(express.static('public'));

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
        res.redirect(req.baseUrl + '/?notfound=1');
      }
    })
    .catch((err) => {
      console.log('通信エラーです');
    });
});

app.get('/delete', (req, res) => {
  const isbn = req.query.isbn;
  const ndl = req.query.ndl;
  func.deleteDb(isbn, ndl);
  res.redirect(req.baseUrl + '/');
});

app.listen(3000);
console.log('Server running at http://localhost:3000/');