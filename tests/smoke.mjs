// 前端冒烟测试（Playwright + Chromium），用于挡住回归（如操作按钮布局、持久化、排序）。
//
// 运行：
//   node tests/smoke.mjs
//
// 依赖：本机需有 Node 与 Playwright（含一个 Chromium）。
//
// 受限网络环境（无法访问 unpkg 等 CDN）下的可选 env：
//   PLAYWRIGHT_DIR   playwright 安装目录（默认按模块解析 'playwright'）
//   PW_EXECUTABLE    Chromium 可执行文件路径（默认用 Playwright 自带）
//   RESUME_LIBS_DIR  本地托管 react.js / react-dom.js / babel.js / lucide.js 的目录，
//                    用于把 index.html 里的 CDN 脚本改写为本地文件再加载。
//                    （可用 npm 安装 react@18 / @babel/standalone@7 / lucide 后拷贝其 UMD 包获得）
//
// 退出码非 0 表示有断言失败。

import { createRequire } from 'module';
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_DIR || 'playwright');

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LIBS = process.env.RESUME_LIBS_DIR || null;
const EXEC = process.env.PW_EXECUTABLE || undefined;

const CDN_TO_LOCAL = {
  'https://unpkg.com/react@18/umd/react.development.js': 'react.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.development.js': 'react-dom.js',
  'https://unpkg.com/@babel/standalone/babel.min.js': 'babel.js',
  'https://unpkg.com/lucide@latest': 'lucide.js',
};
const MIME = { '.html': 'text/html', '.jsx': 'text/babel', '.css': 'text/css', '.js': 'application/javascript' };

const results = [];
const check = (name, ok) => { results.push({ name, ok }); console.log(`${ok ? '✅' : '❌'} ${name}`); };

const server = createServer(async (req, res) => {
  try {
    let p = req.url.split('?')[0];
    if (p === '/') p = '/index.html';
    if (LIBS && p.startsWith('/__libs/')) {
      const buf = await readFile(join(LIBS, p.slice('/__libs/'.length)));
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      return res.end(buf);
    }
    let buf = await readFile(join(ROOT, p));
    if (p === '/index.html' && LIBS) {
      let html = buf.toString();
      for (const [url, file] of Object.entries(CDN_TO_LOCAL)) html = html.replace(url, `/__libs/${file}`);
      buf = Buffer.from(html);
    }
    res.writeHead(200, { 'Content-Type': MIME[extname(p)] || 'text/plain' });
    res.end(buf);
  } catch { res.writeHead(404); res.end('not found'); }
});

await new Promise(r => server.listen(0, r));
const port = server.address().port;
const browser = await chromium.launch({ executablePath: EXEC });
const page = await browser.newPage();
const pageErrors = [];
page.on('pageerror', e => pageErrors.push(e.message));

try {
  await page.goto(`http://localhost:${port}/`, { waitUntil: 'load' });
  await page.waitForSelector('#pi-name', { timeout: 15000 });

  // 1) 渲染
  check('app renders (root non-empty)', (await page.evaluate(() => document.getElementById('root')?.innerHTML?.length || 0)) > 0);

  // 2) 实时预览 + localStorage 持久化
  await page.fill('#pi-name', '测试用户');
  await page.waitForTimeout(200);
  check('preview reflects typed name', (await page.textContent('.resume-name'))?.includes('测试用户'));
  const stored = await page.evaluate(() => localStorage.getItem('sparkresume:data:v1'));
  check('localStorage persisted name', !!stored && stored.includes('测试用户'));

  // 3) 刷新后恢复
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('#pi-name', { timeout: 15000 });
  check('survives reload', (await page.inputValue('#pi-name')) === '测试用户');

  // 4) 条目上下排序：加一条工作经历，填入两家不同公司，下移第一条，确认顺序交换
  await page.click('text=添加工作经历');
  const companyInputs = page.locator('input[placeholder="某某科技有限公司"]');
  await companyInputs.nth(0).fill('AAA');
  await companyInputs.nth(1).fill('BBB');
  await page.click('[aria-label="下移第 1 段工作经历"]');
  await page.waitForTimeout(200);
  const orderAfter = await page.locator('input[placeholder="某某科技有限公司"]').evaluateAll(els => els.map(e => e.value));
  check('move-down swaps work order', orderAfter[0] === 'BBB' && orderAfter[1] === 'AAA');

  // 5) 导入/导出控件存在
  check('export JSON control present', (await page.locator('text=导出数据 (JSON)').count()) > 0);
  check('import control present', (await page.locator('text=导入数据').count()) > 0);

  // 6) 可访问性：label 关联 + 图标按钮 aria-label
  check('label/for association', await page.evaluate(() => !!document.querySelector('label[for="pi-name"]') && !!document.getElementById('pi-name')));
  check('icon buttons have aria-label', await page.evaluate(() => [...document.querySelectorAll('.btn-icon')].every(b => b.getAttribute('aria-label'))));

  check('no uncaught page errors', pageErrors.length === 0);
} finally {
  await browser.close();
  server.close();
}

const failed = results.filter(r => !r.ok);
if (failed.length) { console.error(`\n${failed.length} check(s) failed.`); process.exit(1); }
console.log(`\nAll ${results.length} checks passed.`);
