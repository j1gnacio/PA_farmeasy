// backend/routes/farmacias.js
const express = require('express');
const router = express.Router();
const farmaciaController = require('../controllers/farmaciaController'); // Asegúrate de tener este controlador

router.get('/', farmaciaController.getAllFarmacias);
router.get('/:id', farmaciaController.getFarmaciaById);
router.post('/', farmaciaController.createFarmacia);
router.put('/:id', farmaciaController.updateFarmacia);
router.delete('/:id', farmaciaController.deleteFarmacia);

module.exports = router;