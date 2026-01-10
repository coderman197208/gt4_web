const jsonServer = require('json-server');
const path = require('path');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

// 设置默认中间件（logger, static, cors 和 no-cache）
server.use(middlewares);

// 添加自定义路由（在使用JSON Server路由之前）
server.use(jsonServer.bodyParser);

// 自定义中间件：添加延迟模拟网络延迟
server.use((req, res, next) => {
  setTimeout(next, 300); // 300ms延迟
});

// 自定义路由：健康检查
server.get('/health', (req, res) => {
  res.jsonp({
    status: 'ok',
    message: 'JSON Server is running',
    timestamp: new Date().toISOString()
  });
});

// 自定义路由：用户登录（模拟）
server.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // 简单的模拟登录验证
  if (username && password) {
    res.jsonp({
      success: true,
      token: 'mock-jwt-token-' + Date.now(),
      user: {
        id: 1,
        username: username,
        role: username === 'admin' ? 'admin' : 'user'
      }
    });
  } else {
    res.status(400).jsonp({
      success: false,
      message: 'Username and password are required'
    });
  }
});

// 自定义路由：获取用户的文章
server.get('/users/:id/posts', (req, res) => {
  const db = router.db; // 获取lowdb实例
  const userId = parseInt(req.params.id);
  const posts = db.get('posts').filter({ authorId: userId }).value();
  res.jsonp(posts);
});

// 使用默认路由器
server.use(router);

// 启动服务器
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`JSON Server is running on http://localhost:${PORT}`);
  console.log(`Resources available at:`);
  console.log(`  - http://localhost:${PORT}/users`);
  console.log(`  - http://localhost:${PORT}/posts`);
  console.log(`  - http://localhost:${PORT}/comments`);
  console.log(`  - http://localhost:${PORT}/health`);
});
