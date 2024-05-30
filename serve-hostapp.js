const http = require('http-server');

const server = http.createServer({
  root: './demo',
  port: 4300,
  https: {
    cert: './ssl/cert.pem',
    key: './ssl/key.pem'
  }
});

server.listen(4300, () => {
  console.log('Serving host app on https://localhost:4300');
});