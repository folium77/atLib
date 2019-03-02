var React = require('react');
var ReactDOM = require('react-dom');

class GetTheCategory extends React.Component{

  renderCategories (data) {
    const categories = [];

    let x = 0;
    let y = 0;
    data.forEach(category => {
      if (category.parent === -1) {
        categories[x] = Object.assign(category, {children:[]});
        x++;
        y = 0;
      } else {
        categories[x-1]['children'][y] = category;
        y++;
      }
    });

    const list = categories.map(category => {
      return (
        <li class="col">
          <a href={`?category=${category.id}`}>{category.name}</a>（{category.count}）
          <ul>
            {category.children.map(category =>
              <li class="col"><a href={`?category=${category.id}`}>{category.name}</a>（{category.count}）</li>
            )}
          </ul>
        </li>
      )
    });

    return list;

  };

  render() {
    const categories = this.props.categories;
    return (
      <div class="categories">
        {this.renderCategories(categories)}
      </div>
    )
  }

}

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
        <GetTheCategory categories={this.state.categories} />
      </React.Fragment>
    );
  }
}

ReactDOM.render(<Content />, document.getElementById("content"))