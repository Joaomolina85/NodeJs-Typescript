import { FastifyInstance } from "fastify";
import { z } from "zod";
import { randomUUID } from "crypto";
import { knex } from "../database";
import { checkSessionIdExists } from "../middlewares/check-session-id-exist";



export async function transactionsRoutes(app: FastifyInstance) {

    app.get('/', {
        preHandler: [
            checkSessionIdExists
        ]
    }, async (req, res) => {

        const { sessionId } = req.cookies;

        const transactions = await knex('transactions')
            .where('session_id', sessionId)
            .select();
        return transactions;
    })

    app.get('/:id', {
        preHandler: [
            checkSessionIdExists
        ]
    }, async (req, res) => {

        const getTransactionsParamsSchema = z.object({
            id: z.string().uuid(),
        })

        const { id } = getTransactionsParamsSchema.parse(req.params);

        const { sessionId } = req.cookies;

        const transaction = await knex('transactions')
            .where({
                session_id: sessionId,
                id: id,
            }).first()

        console.log(transaction);

        return res.status(201).send(transaction);

    })

    app.get('/summary', {
        preHandler: [
            checkSessionIdExists
        ]
    }, async (req, res) => {
        const { sessionId } = req.cookies;

        const summary = await knex('transactions').sum('amount', { as: 'amount' })
            .where('session_id', sessionId)
            .first();

        console.log(summary);
        return { summary };
    })

    app.post('/', async (req, res) => {

        try {

            const createTransactionsBodySchema = z.object({
                title: z.string(),
                amount: z.number(),
                type: z.enum(['credit', 'debit']),
            })

            const { title, amount, type } = createTransactionsBodySchema.parse(req.body);

            let sessionId = req.cookies.sessionId;

            if (!sessionId) {
                sessionId = randomUUID();
                res.cookie('sessionId', sessionId, {
                    path: '/',
                    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias  
                });
            }

            await knex('transactions').insert({
                id: randomUUID(),
                title,
                amount: type === 'credit' ? amount : amount * -1,
                session_id: sessionId,
            });
            console.log(req.body);
            console.log(sessionId);
            return res.status(201).send('Criado com Sucesso!!!');

        } catch (error) {
            console.log(error);
        }
    })

    app.delete('/:id', {
        preHandler: [
            checkSessionIdExists
        ]
    }, async (req, res) => {

        const getTransactionsParamsSchema = z.object({
            id: z.string().uuid(),
        })

        const { id } = getTransactionsParamsSchema.parse(req.params);

        try {
        const deleted = await knex('transactions').where('id', id).delete();
        console.log(deleted);
        return res.status(200).send('Excluido com Sucesso!');
        } catch (error) {
            console.log(error);
            return res.status(400).send('Erro ao excluir');
        }

    })
}