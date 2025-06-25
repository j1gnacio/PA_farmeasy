const express = require('express');
const router = express.Router();
const precioController = require('../controllers/precioController');

router.get('/medicamento/:medicamentoId', precioController.getPreciosPorMedicamento);
router.post('/', precioController.addPrecio);
router.put('/:id', precioController.updatePrecio); // Para actualizar precios
module.exports = router;