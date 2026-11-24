import test from 'node:test';
import assert from 'node:assert';
import db from '../db.js';
import {
  createSession,
  cancelSession,
  SessionConflictError,
  NotOwnerError,
} from '../services/sessions.js';
import { summarizeNotes } from '../services/summary.js';

function mockQuery(handler) {
  const original = db.query;
  db.query = handler;
  return () => {
    db.query = original;
  };
}

test('createSession rejects when start >= end', async () => {
  await assert.rejects(
    () => createSession(1, 2, 'Title', '2026-11-25T12:00:00Z', '2026-11-25T11:00:00Z'),
    /Start time must be before end time/
  );
});

test('createSession rejects overlapping session with 409', async () => {
  const restore = mockQuery(async () => ({ rows: [{ id: 99 }] }));
  try {
    await assert.rejects(
      () => createSession(1, 2, 'Title', '2026-11-25T10:00:00Z', '2026-11-25T11:00:00Z'),
      (err) => err instanceof SessionConflictError && err.status === 409
    );
  } finally {
    restore();
  }
});

test('createSession inserts and returns created session', async () => {
  let step = 0;
  const restore = mockQuery(async () => {
    step += 1;
    if (step === 1) return { rows: [] };
    return { rows: [{ id: 10, title: 'Study' }] };
  });
  try {
    const created = await createSession(1, 2, 'Study', '2026-11-25T10:00:00Z', '2026-11-25T11:00:00Z');
    assert.strictEqual(created.id, 10);
  } finally {
    restore();
  }
});

test('cancelSession handles missing, non-owner 403, and owner delete', async () => {
  let restore = mockQuery(async () => ({ rows: [] }));
  try {
    await assert.rejects(() => cancelSession(1, 55), /Session not found/);
  } finally {
    restore();
  }

  restore = mockQuery(async () => ({ rows: [{ id: 55, creator_id: 99 }] }));
  try {
    await assert.rejects(
      () => cancelSession(1, 55),
      (err) => err instanceof NotOwnerError && err.status === 403
    );
  } finally {
    restore();
  }

  const queries = [];
  restore = mockQuery(async (sql) => {
    queries.push(sql);
    if (queries.length === 1) return { rows: [{ id: 55, creator_id: 1 }] };
    return { rows: [] };
  });
  try {
    const res = await cancelSession(1, 55);
    assert.deepStrictEqual(res, { success: true });
    assert.ok(queries[1].startsWith('DELETE FROM study_sessions'));
  } finally {
    restore();
  }
});

test('summarizeNotes handles empty notes, missing key fallback, apiKey fallback, fake client, timeout, and errors', async () => {
  const prevKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;

  try {
    assert.strictEqual(await summarizeNotes(''), '');
    assert.strictEqual(await summarizeNotes('raw notes'), 'raw notes');

    process.env.GEMINI_API_KEY = 'test-key';
    assert.strictEqual(await summarizeNotes('with key no client'), 'with key no client');
    delete process.env.GEMINI_API_KEY;

    const fakeClient = { generate: async (n) => `summary:${n}` };
    assert.strictEqual(await summarizeNotes('lecture', fakeClient), 'summary:lecture');

    const slowClient = {
      generate: async (_n, { signal }) =>
        new Promise((resolve) => {
          setTimeout(() => resolve(signal.aborted ? 'aborted' : 'ok'), 20);
        }),
    };
    assert.strictEqual(await summarizeNotes('slow', slowClient, 5), 'aborted');

    const failingClient = {
      generate: async () => {
        throw new Error('timeout');
      },
    };
    assert.strictEqual(await summarizeNotes('fallback text', failingClient), 'fallback text');
  } finally {
    if (prevKey !== undefined) process.env.GEMINI_API_KEY = prevKey;
    else delete process.env.GEMINI_API_KEY;
  }
});