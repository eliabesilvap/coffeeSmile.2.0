const http = require('http');
const path = require('path');
const { spawn } = require('child_process');

const API_PORT = 4010;
const WEB_PORT = 3000;

const categories = [
  { id: 'cat-1', name: 'Cafe', slug: 'cafe' },
  { id: 'cat-2', name: 'Teologia', slug: 'teologia' },
];

const posts = Array.from({ length: 10 }, (_, index) => {
  const number = index + 1;
  const category = number % 2 === 0 ? categories[0] : categories[1];
  return {
    id: `post-${number}`,
    title: `Post ${number}`,
    slug: `post-${number}`,
    excerpt: `Excerto do post ${number}.`,
    content: `# Post ${number}\n\nConteudo de teste para o post ${number}.`,
    coverImageUrl: '/images/cover-default.svg',
    author: 'Equipe CoffeeSmile',
    publishedAt: new Date(Date.UTC(2024, 0, number)).toISOString(),
    readingTime: 4 + (number % 3),
    tags: number % 2 === 0 ? ['cafe'] : ['teologia'],
    status: 'published',
    category,
  };
});

function sendJson(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

function applyFilters(params) {
  let results = posts.slice();
  const category = params.get('category');
  const tag = params.get('tag');
  const q = params.get('q');
  const sort = params.get('sort');

  if (category) {
    results = results.filter((post) => post.category.slug === category);
  }

  if (tag) {
    results = results.filter((post) => post.tags.includes(tag));
  }

  if (q) {
    const needle = q.toLowerCase();
    results = results.filter(
      (post) =>
        post.title.toLowerCase().includes(needle) ||
        post.excerpt.toLowerCase().includes(needle),
    );
  }

  results.sort((a, b) => {
    if (sort === 'recent' || !sort) {
      return new Date(b.publishedAt) - new Date(a.publishedAt);
    }
    return 0;
  });

  return results;
}

function handleCategories(res) {
  const data = categories.map((category) => {
    const count = posts.filter((post) => post.category.slug === category.slug).length;
    return { ...category, count };
  });

  sendJson(res, 200, { data });
}

function handlePosts(res, params) {
  const page = Number(params.get('page') ?? '1');
  const pageSize = Number(params.get('limit') ?? '9');
  const filtered = applyFilters(params);
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);

  sendJson(res, 200, {
    data,
    meta: {
      page,
      pageSize,
      total,
      totalPages,
    },
  });
}

function handlePost(res, slug) {
  const post = posts.find((item) => item.slug === slug);
  if (!post) {
    sendJson(res, 404, { message: 'Nao foi possivel carregar.' });
    return;
  }

  const relatedPosts = posts
    .filter((item) => item.slug !== slug && item.category.slug === post.category.slug)
    .slice(0, 3);

  sendJson(res, 200, { data: { ...post, relatedPosts } });
}

const apiServer = http.createServer((req, res) => {
  if (!req.url) {
    sendJson(res, 404, { message: 'Rota invalida.' });
    return;
  }

  const url = new URL(req.url, `http://localhost:${API_PORT}`);

  if (req.method === 'GET' && url.pathname === '/api/categories') {
    handleCategories(res);
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/posts') {
    handlePosts(res, url.searchParams);
    return;
  }

  if (req.method === 'GET' && url.pathname.startsWith('/api/posts/')) {
    const slug = url.pathname.replace('/api/posts/', '');
    handlePost(res, slug);
    return;
  }

  sendJson(res, 404, { message: 'Rota invalida.' });
});

apiServer.listen(API_PORT, () => {
  const webEnv = {
    ...process.env,
    NEXT_PUBLIC_API_URL: `http://localhost:${API_PORT}`,
    PORT: String(WEB_PORT),
  };

  const webProcess = spawn('pnpm', ['dev'], {
    cwd: path.resolve(__dirname, '..'),
    env: webEnv,
    shell: true,
    stdio: 'inherit',
  });

  const shutdown = () => {
    apiServer.close();
    webProcess.kill();
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
});
