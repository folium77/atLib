const cat = require('./category.json');
const categories = Array.from(cat);
const result = [];

categories.forEach((category, i) => {
  const id = String(category.id);
  if (id.search(/^\d{0,2}0$/) === 0) {
    const aryay = { id : category.id, name: category.name, count: category.count, parent: null }
    parentId = category.id;
    result.push(aryay);
  } else {
    const aryay = { id : category.id, name: category.name, count: category.count, parent: parentId }
    result.push(aryay);
  }
});

server.get('/test', function(req, res) {
  res.send(result);
});