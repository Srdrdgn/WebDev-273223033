import db from '../db.js';

export class SessionConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SessionConflictError';
    this.status = 409;
  }
}

export class NotOwnerError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotOwnerError';
    this.status = 403;
  }
}

export async function createSession(userId, groupId, title, starts_at, ends_at) {
  if (new Date(starts_at) >= new Date(ends_at)) {
    throw new Error('Start time must be before end time');
  }

  const existing = await db.query(
    `SELECT * FROM study_sessions
     WHERE group_id = $1 AND (($2 < ends_at) AND ($3 > starts_at))`,
    [groupId, starts_at, ends_at]
  );

  if (existing.rows.length > 0) {
    throw new SessionConflictError(`Session overlaps with an existing session in group ${groupId}`);
  }

  const result = await db.query(
    `INSERT INTO study_sessions (group_id, creator_id, title, starts_at, ends_at)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [groupId, userId, title, starts_at, ends_at]
  );

  return result.rows[0];
}

export async function cancelSession(userId, sessionId) {
  const sessionResult = await db.query('SELECT * FROM study_sessions WHERE id = $1', [sessionId]);
  if (sessionResult.rows.length === 0) {
    throw new Error('Session not found');
  }

  const session = sessionResult.rows[0];
  if (session.creator_id !== userId) {
    throw new NotOwnerError('Only the creator of this session can cancel it');
  }

  await db.query('DELETE FROM study_sessions WHERE id = $1', [sessionId]);
  return { success: true };
}