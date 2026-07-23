export function errorHandler(err, req, res, next) {

  console.error(err);

  if (err.name === "ZodError") {
    return res.status(400).json({
      erro: "Dados inválidos.",
      detalhes: err.issues
    });
  }

  return res.status(500).json({
    erro: "Erro interno do servidor."
  });
}