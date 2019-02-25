const request = require('superagent');
const cheerio = require('cheerio');
const MongoClient = require('mongodb').MongoClient;
const mongodbUrl = "mongodb://127.0.0.1:27017/";

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
        ・フリガナが取れないものもある 978-4778314378 など
      */
      const book = data[0].summary;
      const contributor = alphabetCheck(data[0].onix.DescriptiveDetail.Contributor);
      const personName = contributor.PersonName;
      const author = personName.content;
      const author_kana = (personName.collationkey) ? personName.collationkey : author;
      const pubdate = new Date(book.pubdate.replace(/^(\d{4})(\d{2})(\d{2})/,'$1/$2/$3'));
      const cat = require('./ndc9.json');
      const $ = cheerio.load(res.text);
      const ndl9 = $('dc\\:subject[xsi\\:type="dcndl:NDC9"]').eq(0).text();
      const bookInfo = {
        'isbn'        : book.isbn,
        'title'       : book.title,
        'author'      : author,
        'author_kana' : author_kana,
        'publisher'   : book.publisher,
        'pub_date'     : pubdate,
        'cover'       : book.cover,
        'ndl9'        : ndl9,
        'category'    : cat[Math.floor(ndl9)],
        'post_date'   : new Date()
      }

      resolve(bookInfo);

    });
  });
};

// Contributorの最初がアルファベットだったらカタカナのものを返す
const alphabetCheck = (contributors) => {
  const regex  = /^[a-zA-Z\u00C0-\u017F]+(([',. -][a-zA-Z \u00C0-\u017F])?[a-zA-Z\u00C0-\u017F]*)*$/g; //アルファベットの人名に一致
  const result = contributors.filter(val => {
    if ( val.PersonName.content.search(regex) === -1 && val.ContributorRole[0] === 'A01') {
      return val;
    }
  });
  return result[0];
};

// SELECT DB
exports.selectDb = (res) => {
  MongoClient.connect(mongodbUrl, function(err, db) {
    if (err) throw err;
    var dbo = db.db('atlib');
    //var obj = {isbn: '9784003751091'}; 絞り込み時 find() にいれる。
    dbo.collection('books').find().toArray(function(err, books) {
      if (err) throw err;
      res.send(books);
      db.close();
    });
  });
};

// INSERT DB
exports.insertDb = (data) => {
  MongoClient.connect(mongodbUrl, function(err, db) {
    if (err) throw err;
    const dbo = db.db('atlib');
    const obj = data;

    dbo.collection('books').insertOne(obj , function(err, res) {
      if (err) throw err;
      db.close();
    });
  });
};