var React = require('react');

const DefaultLayout = (props) => {
  return (
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>atLib</title>
      </head>
      <body>
        <form action="/post/" method="get">
          <input type="text" name="isbn" placeholder="ISBNを入力" />
          <button>SEND</button>
        </form>
        {props.children}
      </body>
    </html>
  );
}

module.exports = DefaultLayout;