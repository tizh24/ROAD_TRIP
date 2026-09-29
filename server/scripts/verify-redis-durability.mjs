import { Queue } from 'bullmq';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

function createQueue() {
  const redisUrl = new URL(process.env.REDIS_URL ?? 'redis://127.0.0.1:6379');
  const connection = {
    host: redisUrl.hostname,
    port: Number(redisUrl.port || 6379),
    username: redisUrl.username || undefined,
    password: redisUrl.password || undefined,
    db: Number(redisUrl.pathname.slice(1) || 0),
    ...(redisUrl.protocol === 'rediss:' ? { tls: {} } : {}),
  };

  return new Queue(process.env.BULLMQ_QUEUE_NAME ?? 'durability-smoke', {
    connection,
    prefix: process.env.BULLMQ_QUEUE_PREFIX ?? 'roadtrip:bullmq',
  });
}

export async function enqueueDurabilityJob() {
  const queue = createQueue();
  try {
    await queue.obliterate({ force: true });
    const jobId = `durability-smoke-${Date.now()}`;
    const job = await queue.add(
      'durability.smoke',
      { createdAt: new Date().toISOString() },
      { jobId, removeOnComplete: false, removeOnFail: false },
    );
    const state = await job.getState();
    if (state !== 'waiting') {
      throw new Error(`Expected waiting job, received ${state}`);
    }
    return jobId;
  } finally {
    await queue.close();
  }
}

export async function checkDurabilityJob(jobId) {
  if (!jobId) throw new Error('A job ID is required');
  const queue = createQueue();
  try {
    const job = await queue.getJob(jobId);
    if (!job) throw new Error(`Job ${jobId} was lost`);
    const state = await job.getState();
    if (state !== 'waiting') {
      throw new Error(`Expected waiting job after restart, received ${state}`);
    }
    await queue.obliterate({ force: true });
    return state;
  } finally {
    await queue.close();
  }
}

async function runCli() {
  const [command, jobIdArgument] = process.argv.slice(2);
  if (command === 'enqueue') {
    console.log(await enqueueDurabilityJob());
    return;
  }
  if (command === 'check') {
    const state = await checkDurabilityJob(jobIdArgument);
    console.log(`${jobIdArgument}:${state}`);
    return;
  }
  throw new Error('Usage: verify:redis-durability <enqueue|check> [job-id]');
}

const entryPoint = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : undefined;
if (entryPoint === import.meta.url) await runCli();
