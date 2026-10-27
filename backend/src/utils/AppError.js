// Erro "esperado" (400, 404, 409...). Qualquer outro erro vira 500 genérico.
class AppError extends Error {
  constructor(status, mensagem, detalhes) {
    super(mensagem);
    this.status = status;
    this.detalhes = detalhes;
  }
}

module.exports = AppError;
