import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { Queue } from 'bullmq';
import express from 'express';
import basicAuth from 'express-basic-auth';
import { redactJobData } from './redact-job-data.mjs';

const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required.`);
  return value;
};

const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be a valid TCP port.');
}

const queue = new Queue(process.env.BULLMQ_QUEUE_NAME ?? 'integration-events', {
  connection: { url: required('REDIS_URL') },
  prefix: process.env.BULLMQ_QUEUE_PREFIX ?? 'roadtrip:bullmq',
});
const queueAdapter = new BullMQAdapter(queue, { readOnlyMode: true });
queueAdapter.setFormatter('data', redactJobData);
queueAdapter.setFormatter('returnValue', () => '[REDACTED]');

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/');
createBullBoard({ queues: [queueAdapter], serverAdapter });

const app = express();
app.get('/healthcheck', (_request, response) => response.json({ status: 'ok' }));
app.use(
  basicAuth({
    challenge: true,
    users: { [required('USER_LOGIN')]: required('USER_PASSWORD') },
  }),
);
app.use('/', serverAdapter.getRouter());

const server = app.listen(port);
const shutdown = async () => {
  server.close();
  await queue.close();
};
process.once('SIGTERM', () => void shutdown());
process.once('SIGINT', () => void shutdown());
