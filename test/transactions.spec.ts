import { it, expect, beforeAll, afterAll, describe, beforeEach } from 'vitest';
import { execSync } from 'node:child_process';
import request from 'supertest';
import { app } from '../src/app';

describe('Transaction routes', () => {

  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach( () => {
    execSync('npm run knex migrate:rollback --all');
    execSync('npm run knex migrate:latest');
  })



  it('The user can created new transaction', async () => {
     await request(app.server)
      .post('/transactions')
      .send({
        title: 'new transaction',
        amount: 100,
        type: 'deposit',
      })
    .expect(200);
  })

  //ver pq esta dando erro esse.
  it('Poderao listar todas as transações', async () => {
    const createdTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'new transaction',
        amount: 100,
        type: 'deposit',
      })
      
      const cookies = createdTransactionResponse.get('Set-Cookie')
      
      const listTransactionResponse = await request(app.server)
        .get('/transactions')
        .set('Cookie', cookies)
        .expect(200)

      expect(listTransactionResponse.body.transactions).toEqual([
        expect.objectContaining({
          title: 'new transaction',
          amount: 100,
        }),
      ])
  })

  it('Poderao listar todas as transações especificas', async () => {
    const createdTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'new transaction',
        amount: 100,
        type: 'deposit',
      })
      
      const cookies = createdTransactionResponse.get('Set-Cookie')
      
      const listTransactionResponse = await request(app.server)
        .get('/transactions')
        .set('Cookie', cookies)
        .expect(200)

        const transactionId = listTransactionResponse.body.transactions[0].id

        const getTransactionResponse = await request(app.server)
        .get(`/transactions/${transactionId}`)
        .set('Cookie', cookies)
        .expect(200)

      expect(getTransactionResponse.body.transaction).toEqual(
        expect.objectContaining({
          title: 'new transaction',
          amount: 100,
        }),
    )
  })

  it('Poderao listar todas as transações somadas', async () => {
    const createdTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'credit transaction',
        amount: 5000,
        type: 'credit',
      })

      
      
      const cookies = createdTransactionResponse.get('Set-Cookie')

      await request(app.server)
      .post('/transactions')
      .set('Cookie', cookies)
      .send({
        title: 'debit transaction',
        amount: 2000,
        type: 'deposit',
      })
      
      const summaryResponse = await request(app.server)
        .get('transactions/summary')
        .set('Cookie', cookies)
        .expect(200)

      expect(summaryResponse.body.summary).toEqual({
        amount: 3000,
      })
  })
})

