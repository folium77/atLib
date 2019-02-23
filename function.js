const request = require('superagent');
const cheerio = require('cheerio');
const MongoClient = require('mongodb').MongoClient;

// 書籍情報取得
exports.getBookInfo = (isbn) => {
  const baseUrl = `https://api.openbd.jp/v1/get?isbn=${isbn}`;
  return new Promise((resolve, reject) => {
   request.get(baseUrl).end((err, res) => {
      if (err) {
        reject(err);
      }
      resolve(res.body);
    });
  })
};

// 分類名取得
exports.getBookNDC = (isbn, data) => {
  const baseUrl = `http://iss.ndl.go.jp/api/opensearch?mediatype=1&isbn=${isbn}`;
  return new Promise((resolve, reject) => {
   request.get(baseUrl).buffer().end((err, res) => {
      if (err) {
        reject(err);
      }

      /*
        ・新刊はNDL9がない（国会図書館にない）場合があるので対策。
        ・書影がない場合の対策（自分で入力できるようにする）
      */
      const book = data[0].summary;
      const personName = data[0].onix.DescriptiveDetail.Contributor.slice(-1)[0].PersonName;
      const author = personName.content;
      const author_kana = (personName.collationkey) ? personName.collationkey : author;
      const pubdate = new Date(book.pubdate.replace(/^(\d{4})(\d{2})(\d{2})/,'$1/$2/$3'));
      const cat = require('./ndc9.json');
      const $ = cheerio.load(res.text);
      const ndl9 = $('dc\\:subject[xsi\\:type="dcndl:NDC9"]').text();
      const bookInfo = {
        'isbn'        : book.isbn,
        'title'       : book.title,
        'author'      : author,
        'author_kana' : author_kana,
        'publisher'   : book.publisher,
        'pubdate'     : pubdate,
        'cover'       : book.cover,
        'ndl9'        : ndl9,
        'category'    : cat[Math.floor(ndl9)],
        'post_date'   : new Date()
      }

      resolve(bookInfo);

    });
  });
};

// DB書き込み
exports.insertDb = (data) => {
  const url = "mongodb://127.0.0.1:27017/";
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    const dbo = db.db('testdb');
    const obj = data;

    dbo.collection('testCollection').insertOne(obj , function(err, res) {
      if (err) throw err;
      db.close();
    });
  });
};