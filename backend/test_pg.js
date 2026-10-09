const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://nisaimaktabi:nisaimaktabi@localhost:5432/nisaimaktabi?schema=public'
    }
  }
});
p.$connect()
  .then(() => {
    console.log('CONNECTED OK');
    return p.$disconnect();
  })
  .catch(e => {
    console.log('ERROR:', e.message);
    process.exit(1);
  });
