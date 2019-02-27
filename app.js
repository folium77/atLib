const express = require('express');
const server = express();
const path = require('path');
const func = require('./function.js');

// correspond Express and React
server.use(express.static(path.join(__dirname, 'build')));

server.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

//Get book data
server.get('/api', (req, res) => {
  func.selectDb(req, res,);
});

//Posted book data
server.get('/post', (req, res) => {
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

//Deleting book data
server.get('/delete', (req, res) => {
  const isbn = req.query.isbn;
  const ndl = req.query.ndl;
  func.deleteDb(isbn, ndl);
  res.redirect(req.baseUrl + '/');
});

server.listen(3000);
console.log('Server running at http://localhost:3000/');