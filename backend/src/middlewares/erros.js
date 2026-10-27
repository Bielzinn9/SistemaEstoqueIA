const AppError = require('../utils/AppError');

function naoEncontrado(req, res) {
  res.status(404).json({ erro: 'Rota não encontrada.' });
}

// Express 5 encaminha erros de handlers async para cá automaticamente.
// eslint-disable-next-line no-unused-vars
function tratarErros(erro, req, res, next) {
  if (erro instanceof AppError) {
    const corpo = { erro: erro.message };
    if (erro.detalhes) corpo.detalhes = erro.detalhes;
    return res.status(erro.status).json(corpo);
  }

  if (erro.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido no corpo da requisição.' });
  }

  if (erro.type === 'entity.too.large') {
    return res.status(413).json({ erro: 'Corpo da requisição muito grande.' });
  }

  // Detalhes técnicos ficam só no log do servidor, nunca vão ao navegador.
  console.error('Erro inesperado:', erro.message);
  res.status(500).json({ erro: 'Erro interno. Tente novamente mais tarde.' });
}

module.exports = { naoEncontrado, tratarErros };
