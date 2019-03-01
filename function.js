const request = require('superagent');
const cheerio = require('cheerio');
const MongoClient = require('mongodb').MongoClient;
const dbUrl = "mongodb://127.0.0.1:27017/";

// 書籍情報取得
getBookInfo = (isbn) => {
  const baseUrl = `https://api.openbd.jp/v1/get?isbn=${isbn}`;
  return new Promise((resolve, reject) => {
   request.get(baseUrl).end((err, res) => {
      if (err) reject(err);
      resolve(res.body);
    });
  })
};

// 分類名取得
getBookNDC = (isbn, data) => {
  const baseUrl = `http://iss.ndl.go.jp/api/opensearch?mediatype=1&isbn=${isbn}`;
  return new Promise((resolve, reject) => {
   request.get(baseUrl).buffer().end((err, res) => {
      if (err) reject(err);
      resolve(createBookInfo(data, res));
    });
  });
};

// 書籍を登録
exports.postedBook = (req, res) => {
  const isbn = req.query.isbn;
  getBookInfo(isbn)
    .then((result) => {
      if (result[0]) {
        return getBookNDC(isbn, result);
      }
    })
    .then((result) => {
      if (result) {
        insertDb(res, req, result);
      } else {
        res.redirect(req.baseUrl + '/?notfound=1');
      }
    })
    .catch((err) => {
      console.log('通信エラーです');
    });
};

// Contributorの最初がアルファベットだったらカタカナのものを返す
const alphabetCheck = (contributors) => {
  const regex  = /^[a-zA-Z\u00C0-\u017F]+(([',\. -][a-zA-Z \u00C0-\u017F])?[',\. -][a-zA-Z\u00C0-\u017F]*)*$/g; //アルファベットの人名に一致
  const result = contributors.filter(val => {
    if ( val.PersonName.content.search(regex) === -1 && val.ContributorRole[0] === 'A01') {
      return val;
    }
  });
  return result[0];
};

// 書籍情報の配列を作成
const createBookInfo = (data, res) => {
  /*
    ・新刊はNDL9がない（国会図書館にない）場合があるので対策
    ・書影がない場合の対策（自分で入力できるようにする）
    ・フリガナが取れないものもある
  */
  const book = data[0].summary;
  const contributor = alphabetCheck(data[0].onix.DescriptiveDetail.Contributor);
  const personName = contributor.PersonName;
  const author = personName.content;
  const author_kana = (personName.collationkey) ? personName.collationkey : '';
  const pubdate = book.pubdate.replace(/^(\d{4})(\d{2})(\d{2})/,'$1/$2/$3');
  const supplyDetail = data[0].onix.ProductSupply.SupplyDetail.Price;
  const price = (supplyDetail) ? supplyDetail[0].PriceAmount : '';
  const cat = require('./ndc9.json');
  const $ = cheerio.load(res.text);
  const ndl8 = $('dc\\:subject[xsi\\:type="dcndl:NDC8"]').eq(0).text();
  const ndl9 = $('dc\\:subject[xsi\\:type="dcndl:NDC9"]').eq(0).text();
  const ndl = (ndl9) ? ndl9 : ndl8;
  return {
    'isbn'        : book.isbn,
    'title'       : book.title,
    'author'      : author,
    'author_kana' : author_kana,
    'publisher'   : book.publisher,
    'pub_date'    : new Date(pubdate),
    'price'　　　　: price,
    'cover'       : book.cover,
    'ndl'         : ndl,
    'category'    : cat[ndl.slice(0,3)],
    'post_date'   : new Date()
  }
};

// INSERT DB
insertDb = (res, req, data) => {
  MongoClient.connect(dbUrl, (connectErr, db) => {
    if (connectErr) throw connectErr;
    const dbo = db.db('atlib');
    dbo.collection('books').insertOne(data , (dboErr, dboRes)  => {
      if (dboErr) console.log(dboErr);
      res.send(dboRes.ops);
      db.close();
    });

    // categoryのcountを増やす
    const id = data.ndl.slice(0,3).replace(/^0{1,2}/, '');
    const cotegory = {cotegory_id: Number(id)};
    const set = {$inc: {count: 1}};
    dbo.collection('categories').updateOne(cotegory, set, (dboErr, dboRes) => {
      if (dboErr) throw dboErr;
      db.close();
    });
  });
};

// DELETE DB
exports.deleteDb = (req, res) => {
  MongoClient.connect(dbUrl, (connectErr, db) => {
    if (connectErr) throw connectErr;
    const dbo = db.db('atlib');
    const isbn = {isbn: req.query.isbn};
    dbo.collection('books').deleteOne(isbn, (dboErr, dboRes) => {
      if (dboErr) throw dboErr;
      db.close();
    });

    // categoryのcountを減らす
    const id = req.query.ndl.slice(0,3).replace(/^0{1,2}/, '');
    const cotegory = {cotegory_id: Number(id)};
    const set = {$inc: {count: -1}};
    dbo.collection('categories').updateOne(cotegory, set, (dboErr, dboRes) => {
      if (dboErr) throw dboErr;
      res.redirect(req.baseUrl + '/');
      db.close();
    });
  });
};

// SELECT DB
exports.selectDb = (req, res) => {
  MongoClient.connect(dbUrl, (connectErr, db) => {
    if (connectErr) throw connectErr;
    const dbo = db.db('atlib');
    const get = req.query.get;
    const find = ( get === 'categories') ? {count : {$gte: 1}} : {};
    const sort = ( get === 'categories') ? {cotegory_id: 1} : {post_date: -1};
    dbo.collection(get).find(find).sort(sort).toArray((dboErr, dboRes) => {
      if (dboErr) throw dboErr;
      res.send(dboRes);
      db.close();
    });
  });
};