// Usado pelos testes do navegador: um servidor de arquivos parecido com o GitHub Pages, e o Chrome.
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { gzipSync } from 'node:zlib';
import { chromium } from 'playwright-core';

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};
const compressible = new Set(['.html', '.js', '.mjs', '.css', '.json', '.svg']);

export function serve(root, port) {
  return new Promise((resolve) => {
    const server = createServer((request, response) => {
      let file = join(root, normalize(decodeURIComponent(request.url.split('?')[0])));
      if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
      if (!existsSync(file)) {
        response.writeHead(404);
        response.end('not found');
        return;
      }
      const extension = extname(file);
      const body = compressible.has(extension) ? gzipSync(readFileSync(file)) : readFileSync(file);
      response.writeHead(200, {
        'Content-Type': types[extension] ?? 'application/octet-stream',
        'Content-Length': body.length,
        ...(compressible.has(extension) && { 'Content-Encoding': 'gzip' }),
      });
      response.end(body);
    });
    server.listen(port, () => resolve(server));
  });
}

// CHROME aponta para um navegador quando ele não está nos lugares de costume.
const chromePaths = [
  process.env.CHROME,
  '/Applications/Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);

export const launch = () => chromium.launch({ executablePath: chromePaths.find(existsSync), headless: true });
