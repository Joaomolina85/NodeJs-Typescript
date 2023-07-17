import { app } from './app';
import { env } from './env';

app.listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('HTTP server running on port 3333')
  });

  //video para começar a ver proximo modulo, sobre deploy;













