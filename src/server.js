import { config } from './config.js';
import db from '../db.js';

const { default: express } = await import('express');

const app = express();
app.use(express.json());

process.on('unhandledRejection', (err) => {
  console.error('unhandledRejection:', err);
});

app.get('/health', async (_req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok', db: 'ok' });
  } catch (err) {
    console.error('health check failed:', err.message);
    res.status(503).json({ status: 'error', db: 'down' });
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status ?? (err.type === 'entity.parse.failed' ? 400 : 500);
  res.status(status).json({
    error: status < 500 ? 'That request is not valid' : 'Something went wrong on our side',
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`listening on port ${config.port}`);
  });
}

export default app;