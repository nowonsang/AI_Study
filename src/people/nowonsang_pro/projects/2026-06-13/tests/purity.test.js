// AC3: engine/*.js 가 순수(외부 UI 프레임워크/DOM 의존 0)임을 정적 스캔으로 단언.
// Node 내장 러너만 사용 (의존성 0): node --test engine/ tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const engineDir = join(here, '..', 'engine');
const engineFiles = readdirSync(engineDir).filter((f) => f.endsWith('.js') && !f.endsWith('.test.js'));

test('스캔 대상 engine 파일이 존재', () => {
  assert.ok(engineFiles.length > 0);
});

for (const f of engineFiles) {
  test(`${f}: react/jsx/document 토큰 없음`, () => {
    const src = readFileSync(join(engineDir, f), 'utf8');
    assert.equal(/\breact\b/i.test(src), false);
    assert.equal(/\bjsx\b/i.test(src), false);
    assert.equal(/\bdocument\b/i.test(src), false);
  });

  test(`${f}: DOM/React import 구문 없음, 상대/node import 만`, () => {
    const src = readFileSync(join(engineDir, f), 'utf8');
    const importLines = src.split('\n').filter((l) => /^\s*import\b/.test(l));
    for (const line of importLines) {
      assert.equal(/['"](react|react-dom)/.test(line), false);
      // engine 은 같은 폴더의 상대 모듈 또는 node: 만 import 해야 함
      assert.ok(/from\s+['"]\.\.?\//.test(line) || /from\s+['"]node:/.test(line));
    }
  });
}
