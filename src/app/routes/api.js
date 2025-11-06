const express = require('express');
const router = express.Router();

const usuarioRoutes = require('./usuario');
router.use('/usuario', usuarioRoutes);

module.exports = router;