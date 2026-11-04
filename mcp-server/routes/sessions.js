import express from 'express';
import { createSession, cancelSession, SessionConflictError, NotOwnerError } from '../services/sessions.js';

const router = express.Router();

function ensureAuthenticated(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Sign in first' });
  }
  next();
}

router.post('/api/groups/:groupId/sessions', ensureAuthenticated, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { title, startsAt, endsAt } = req.body;
    const userId = req.session.userId;

    const session = await createSession(userId, Number(groupId), title, startsAt, endsAt);
    return res.status(201).json({ session });
  } catch (err) {
    if (err instanceof SessionConflictError) {
      return res.status(409).json({ error: err.message });
    }
    return res.status(422).json({ error: err.message });
  }
});

router.delete('/api/sessions/:id', ensureAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId;

    await cancelSession(userId, Number(id));
    return res.status(204).send();
  } catch (err) {
    if (err instanceof NotOwnerError) {
      return res.status(403).json({ error: err.message });
    }
    if (err.message === 'Session not found') {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
});

export default router;