// 本ソフトウェアは教育目的および研究目的で公開されています。
// このコードの使用、複製、改変、再配布等は利用者の責任において行ってください。
// 開発者は、本コードの使用によって生じたいかなる損害・トラブルについても責任を負いません。
// 本コードの使用が法令や利用規約に抵触しないことを、利用者自身が確認してください。

const fs = require('fs');
const http = require('http');
const yaml = require('js-yaml');
const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxyServer({});

const config = yaml.load(fs.readFileSync('./config.yml', 'utf8'));

const targetUrl = config.targetUrl;
const delay = config.delay;
const PORT = config.port;

const server = http.createServer((req, res) => {

  console.log(`[${new Date().toLocaleString('ja-JP')}] ${req.method} ${req.url} へのリクエストを受信。`);

  let body = [];

  req.on('data', chunk => {
    body.push(chunk);
  });

  req.on('end', () => {
    body = Buffer.concat(body);
    console.log(`[${new Date().toLocaleString('ja-JP')}] リクエストボディの受信が完了。${delay}ミリ秒遅延させます...`);

    setTimeout(() => {
      console.log(`[${new Date().toLocaleString('ja-JP')}] ${delay}ミリ秒の遅延が完了。${targetUrl} へプロキシします。`);
      proxy.web(req, res, { target: targetUrl });
    }, delay);
  });

  req.on('error', (err) => {
    console.error(`[${new Date().toLocaleString('ja-JP')}] クライアントリクエストでエラーが発生しました: ${err.message}`);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('サーバー内部エラーが発生しました。');
  });

  req.setTimeout(0);
  res.setTimeout(0);
});

proxy.on('proxyReq', (proxyReq, req, res, options) => {
  console.log(`[${new Date().toLocaleString('ja-JP')}] ターゲットへ ${proxyReq.method} ${proxyReq.path} をプロキシしています。`);
});

proxy.on('proxyRes', (proxyRes, req, res) => {
  console.log(`[${new Date().toLocaleString('ja-JP')}] ターゲットからステータスコード ${proxyRes.statusCode} の応答。`);
});

proxy.on('error', (err, req, res) => {
  console.error(`[${new Date().toLocaleString('ja-JP')}] プロキシ処理中にエラーが発生しました: ${err.message}`);
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.end('サーバー内部エラーが発生しました。');
});

server.listen(PORT, () => {
  console.log(`[${new Date().toLocaleString('ja-JP')}] ${PORT} ポートでサーバーを起動。`);
})