const selfsigned = require('selfsigned');
const fs = require('fs');
const path = require('path');

const attrs = [{ name: 'commonName', value: 'localhost' }];
const opts = {
  days: 365,
  keySize: 2048,
  algorithm: 'sha256',
  extensions: [{ name: 'basicConstraints', cA: true }]
};

const pems = selfsigned.generate(attrs, opts);

const certPath = path.join(__dirname, 'ssl/cert.pem');
const keyPath = path.join(__dirname, 'ssl/key.pem');

if (!fs.existsSync(path.dirname(certPath))) {
  fs.mkdirSync(path.dirname(certPath));
}

fs.writeFileSync(certPath, pems.cert);
fs.writeFileSync(keyPath, pems.private);