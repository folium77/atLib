var React = require('react');
var DefaultLayout = require('./layout');

const book = (props) => {
  return (
    <DefaultLayout>
      {props.books.map((book, index) =>
      <li class="col">
        <figure class="col-cover">
          <img src={book.cover} alt={book.title} />
        </figure>
        <div class="text-left">
          <p class="col-title">{book.title}</p>
          <p class="col-class">NDC：{book.ndl}／{book.category}</p>
          <p class="col-author">{book.author}<span class="col-author__kana">／{book.author_kana}</span></p>
          <p class="col-publisher">出版社：{book.publisher}</p>
          {/*<p class="col-pubdate">発売日：{date}</p>*/}
          <div>
            <form action="/delete/" method="get">
              <input type="hidden" name="isbn" value={book.isbn} />
              <input type="hidden" name="ndl" value={book.ndl} />
              <button>DELETE</button>
            </form>
          </div>
        </div>
      </li>
      )}
    </DefaultLayout>
  );
}

module.exports = book;