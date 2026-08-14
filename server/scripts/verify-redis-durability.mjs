import { Queue } from 'bullmq';

const [command, jobIdArgument] = process.argv.slice(2);
const redisUrl = new URL(process.env.REDIS_URL ?? 'redis://127.0.0.1:6379');
const queueName = process.env.BULLMQ_QUEUE_NAME ?? 'durability-smoke';
const prefix = process.env.BULLMQ_QUEUE_PREFIX ?? 'roadtrip:bullmq';

if (!['enqueue', 'check'].includes(command)) {
  throw new Error('Usage: verify:redis-durability <enqueue|check> [job-id]');
}

const connection = {
  host: redisUrl.hostname,
  port: Number(redisUrl.port || 6379),
  username: redisUrl.username || undefined,
  password: redisUrl.password || undefined,
  db: Number(redisUrl.pathname.slice(1) || 0),
  ...(redisUrl.protocol === 'rediss:' ? { tls: {} } : {}),
};

const queue = new Queue(queueName, { connection, prefix });

try {
  if (command === 'enqueue') {
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
    console.log(jobId);
  } else {
    if (!jobIdArgument) throw new Error('check requires a job ID');
    const job = await queue.getJob(jobIdArgument);
    if (!job) throw new Error(`Job ${jobIdArgument} was lost`);
    const state = await job.getState();
    if (state !== 'waiting') {
      throw new Error(`Expected waiting job after restart, received ${state}`);
    }
    console.log(`${job.id}:${state}`);
    await queue.obliterate({ force: true });
  }
} finally {
  await queue.close();
}
