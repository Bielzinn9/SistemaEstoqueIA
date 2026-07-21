export function dashboard(req, res) {
    return res.json({
      mensagem: `Bem-vindo ${req.usuario.id}`,
      usuario: req.usuario
    });
  }