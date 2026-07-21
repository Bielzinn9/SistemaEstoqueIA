import jwt from "jsonwebtoken";

export function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;

  console.log("AUTH HEADER:", authHeader);

  if (!authHeader) {
    return res.status(401).json({
      erro: "Token não informado."
    });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      erro: "Formato do token inválido."
    });
  }

  const token = authHeader.replace("Bearer ", "");

  // LOGS
  console.log("TOKEN:", token);
  console.log("JWT_SECRET:", process.env.JWT_SECRET);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("TOKEN DECODIFICADO:", decoded);

    req.usuario = decoded;

    next();

  } catch (erro) {
    console.error("ERRO JWT:", erro);

    return res.status(401).json({
      erro: erro.message
    });
  }
}