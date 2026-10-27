const { Router } = require('express');
const c = require('../controllers/reservas.controller');

const router = Router();

router.get('/configuracao', c.configuracao);
router.get('/disponibilidade', c.disponibilidade);

router.get('/reservas', c.listar);
router.get('/reservas/:id', c.obter);
router.post('/reservas', c.criar);
router.put('/reservas/:id', c.atualizar);
router.patch('/reservas/:id/status', c.mudarStatus);
router.delete('/reservas/:id', c.excluir);

module.exports = router;
