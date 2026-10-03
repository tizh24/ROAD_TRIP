import assert from 'node:assert/strict';
import { Queue, Worker } from 'bullmq';

const connection = { host: '127.0.0.1', port: 6379 };
const queueName = 'recovery-replay';
const prefix = 'roadtrip:recovery';
const queue = new Queue(queueName, { connection, prefix });
let calls = 0;
const worker = new Worker(
  queueName,
  async () => {
    calls += 1;
    if (calls === 1) throw new Error('controlled recovery failure');
  },
  { connection, prefix },
);

async function waitFor(job, expected) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if ((await job.getState()) === expected) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`Job did not reach ${expected}.`);
}

try {
  await queue.obliterate({ force: true });
  const job = await queue.add(
    'recovery.replay',
    { safe: true },
    { attempts: 1 },
  );
  await waitFor(job, 'failed');
  const failed = await queue.getFailed();
  assert.equal(failed.length, 1);
  assert.equal(failed[0]?.id, job.id);
  await job.retry();
  await waitFor(job, 'completed');
  assert.equal(calls, 2);
  console.log(
    JSON.stringify({ status: 'pass', jobId: job.id, attempts: calls }),
  );
} finally {
  await worker.close();
  await queue.obliterate({ force: true });
  await queue.close();
}
