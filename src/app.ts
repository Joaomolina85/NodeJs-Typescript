import fastify from 'fastify';
import crypto from 'node:crypto';
import { knex } from './database';
import { env } from './env';
import cookie from '@fastify/cookie';
import { transactionsRoutes } from './routes/transactions';

export const app = fastify();

app.register(cookie);

app.addHook('preHandler', async (req,res) => {
  console.log(`[${req.method}] ${req.url}`);
})

app.register(transactionsRoutes,{
  prefix: 'transactions',
});
