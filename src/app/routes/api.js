// app/routes/api.js
const express = require('express');
const router = express.Router();

router.use('/auditoria', require('../controllers/auditoria'));
router.use('/horario', require('../controllers/horario'));
router.use('/recurso', require('../controllers/recurso'));
router.use('/reserva', require('../controllers/reserva'));
router.use('/sala-recurso', require('../controllers/sala-recurso'));
router.use('/sala', require('../controllers/sala'));
router.use('/usuario', require('../controllers/usuario'));

module.exports = router;
