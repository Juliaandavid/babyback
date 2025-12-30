import Fastify from 'fastify';
import { postgraphile } from 'postgraphile';

const app = Fastify({ logger: true });

// Basic Health Check
app.get('/health', async () => {
  return { status: 'ok' };
});

// PostGraphile Configuration
// Note: This relies on DATABASE_URL env var.
// In a real Serverless environment, connection pooling is critical.
// Fastify v4 does not support 'use' directly (middleware) without @fastify/middie or @fastify/express.
// We are mounting PostGraphile manually for now.

// Initialize PostGraphile Handler once (Global Scope for Serverless Warm Starts)
const postgraphileHandler = postgraphile(
  process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres',
  'public',
  {
    watchPg: process.env.NODE_ENV === 'development',
    graphiql: true,
    enhanceGraphiql: true,
  }
);

app.all('/graphql', (req, reply) => {
  // @ts-ignore - mismatch between fastify raw req/res and node http req/res types in strict mode
  return postgraphileHandler(req.raw, reply.raw);
});

app.all('/graphiql', (req, reply) => {
  // @ts-ignore
  return postgraphileHandler(req.raw, reply.raw);
});

export default app;
