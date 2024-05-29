const http = require('http-server');

const server = http.createServer({
  root: './src',
  https: {
    cert: './ssl/cert.pem',
    key: './ssl/key.pem'
  }
});

server.listen(9001, () => {
  console.log('Serving iframe on https://localhost:9001');
});