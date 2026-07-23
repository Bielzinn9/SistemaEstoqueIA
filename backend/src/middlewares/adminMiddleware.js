export function somenteAdmin(req, res, next) {
  if (req.usuario.perfil !== "ADMIN") {
    return res.status(403).json({
      erro: "Acesso permitido apenas para administradores."
    });
  }

  next();
}