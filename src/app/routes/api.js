const express = require('express');
const router = express.Router();

const usuarioRoutes = require('./usuario');
router.use('/usuario', usuarioRoutes);

const horarioDisponivel = require('./horario-disponivel');
router.use ('/horarioDisponivel', horarioDisponivel);

const salaRoutes = require('./sala');
router.use('/sala', salaRoutes);

const recursoRoutes = require('./recurso');
router.use('/recurso', recursoRoutes);


module.exports = router;