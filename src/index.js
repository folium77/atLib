var React = require('react');
var ReactDOM = require('react-dom');

class Content extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      books: [],
      categories: [],
      value: ''
    };
  }

  async fetchData(cotegory) {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const booksRes = await fetch(`/api/?get=books&category=${category}`);
    const booksJson = await booksRes.json();
    const categoriesRes = await fetch('/api/?get=categories');
    const categoriesJson = await categoriesRes.json();

    this.setState({
      books: booksJson,
      categories: categoriesJson
    });
  }

  componentDidMount() {
    this.fetchData();
  }

  doChange (e) {
    this.setState({ value: e.target.value })
  }

  // handleClick (e, cotegory) {
  //   e.preventDefault();
  //   const pageUrl = `category=${cotegory}`;
  //   window.history.pushState('', '', pageUrl);
  //   onClick={(e) => this.handleClick(e, category.id)}
  // }

  async doSubmit (e, fn, isbn, ndl) {
    e.preventDefault();
    if (fn === 'post') {
      const testRes = await fetch(`/post/?isbn=${this.state.value}`);
    } else {
      const testRes = await fetch(`/delete/?isbn=${isbn}&ndl=${ndl}`);
    }
    this.fetchData();
  }

  render(){
    const books = this.state.books;
    const categories = this.state.categories;
    return(
      <React.Fragment>
        <form onSubmit={e => this.doSubmit(e, 'post')}>
          <input type="text"
            name="isbn"
            placeholder="ISBNを入力してください"
            onChange={e => this.doChange(e)}
            value={this.state.value} />
          <input type="submit" />
        </form>
        <div class="books">
          <ul>
            {books.map((book, index) =>
              <li class="col">
                <figure class="col-cover">
                  <img src={book.cover} alt={book.title} />
                </figure>
                <div class="text-left">
                  <p class="col-title">{book.title}</p>
                  <p class="col-class">NDC：{book.ndl}／{book.category}</p>
                  <p class="col-author">{book.author}<span class="col-author__kana">／{book.author_kana}</span></p>
                  <p class="col-publisher">出版社：{book.publisher}</p>
                  <p class="col-pubdate">発売日：{book.pub_date}</p>
                  <div>
                    <form onSubmit={e => this.doSubmit(e, 'delete', book.isbn, book.ndl)}>
                      <button>DELETE</button>
                    </form>
                  </div>
                </div>
              </li>
            )}
          </ul>
        </div>
        <div class="categories">
          <ul>
            <li class="col"><a href="/">すべて</a></li>
            {categories.map((category, index) =>
              <li class="col"><a href={`?category=${category.id}`}>{category.name}</a>（{category.count}）</li>
            )}
          </ul>
        </div>
      </React.Fragment>
    );
  }
}

ReactDOM.render(<Content />, document.getElementById("content"))