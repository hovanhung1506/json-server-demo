const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const queryString = require('query-string');

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// Add custom routes before JSON Server router
server.get('/echo', (req, res) => {
  res.jsonp(req.query);
});

// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
server.use(jsonServer.bodyParser);
server.use((req, res, next) => {
  if (req.method === 'POST') {
    req.body.createdAt = Date.now();
    req.body.updatedAt = Date.now();
  } else if (req.method === 'PATCH') {
    req.body.updatedAt = Date.now();
  }
  // Continue to JSON Server router
  next();
});

// In this example, returned resources will be wrapped in a body property
router.render = (req, res) => {
  const headers = res.getHeaders();
  const totalCount = headers['x-total-count'];

  if(req.method === 'GET' && totalCount) {
    const query = queryString.parse(req._parsedUrl.query);
    const result = {
      data: res.locals.data,
      pagination: {
        _page: Number.parseInt(query._page) || 1,
        _limit: Number.parseInt(query._limit) || 10,
        _totalRow: Number.parseInt(totalCount)
      }
    }
    return res.jsonp(result)
  }

  res.jsonp({
    body: res.locals.data
  })
}

// Use default router
const PORT = process.env.PORT || 3003;
server.use('/api', router);
server.listen(PORT, () => {
  console.log('JSON Server is running on port ' + PORT);
});
