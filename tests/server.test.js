import test from 'node:test';
import assert from 'node:assert';
import db from '../db.js';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://user:pass@localhost/test';
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'test-secret';

const { default: app } = await import('../src/server.js');

test('GET /health returns 200 when DB is up and 503 when DB is down, plus 404 and 400', async () => {
  const server = app.listen(0);
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;
  const originalQuery = db.query;

  try {
    db.query = async () => ({ rows: [{ '?column?': 1 }] });
    const okRes = await fetch(`${baseUrl}/health`);
    assert.strictEqual(okRes.status, 200);
    assert.deepStrictEqual(await okRes.json(), { status: 'ok', db: 'ok' });

    db.query = async () => {
      throw new Error('db offline');
    };
    const errRes = await fetch(`${baseUrl}/health`);
    assert.strictEqual(errRes.status, 503);
    assert.deepStrictEqual(await errRes.json(), { status: 'error', db: 'down' });

    const notFound = await fetch(`${baseUrl}/does-not-exist`);
    assert.strictEqual(notFound.status, 404);
    assert.deepStrictEqual(await notFound.json(), { error: 'Not found' });

    const badJson = await fetch(`${baseUrl}/health`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{invalid-json',
    });
    assert.strictEqual(badJson.status, 400);
  } finally {
    db.query = originalQuery;
    server.close();
  }
});