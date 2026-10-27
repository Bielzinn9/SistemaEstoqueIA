const app = require('./app');

const porta = Number(process.env.PORT) || 3333;

app.listen(porta, () => {
  console.log(`API de reservas rodando em http://localhost:${porta}`);
});
