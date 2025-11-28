// app/routes/api.js
const express = require('express');
const router = express.Router();

router.use('/auditoria', require('../controllers/auditoriaController'));
router.use('/horario', require('../controllers/horarioController'));
router.use('/recurso', require('../controllers/recursoController'));
router.use('/reserva', require('../controllers/reservaController'));
router.use('/sala-recurso', require('../controllers/salaRecursoController'));
router.use('/sala', require('../controllers/salaController'));
router.use('/usuario', require('../controllers/usuarioController'));
router.use('/relatorio', require('../controllers/relatorioController'));
router.use('/auth', require('../controllers/authController'));

module.exports = router;
