// backend/routes/Medicamento.js
const express = require('express');
const router = express.Router();
// Asegúrate de que esta ruta sea correcta para tu controlador
const medicamentoController = require('../controllers/medicamentoController');

// Define las rutas para los medicamentos y las mapea a las funciones del controlador

// --- Rutas de Búsqueda y Filtro (más específicas, deben ir ANTES de las rutas con :id) ---

// GET /api/medicamentos/search - Buscar medicamentos por nombre y/o otros filtros (como ubicación)
// Esta ruta es más flexible y puede manejar parámetros de consulta (query params)
// Ej: /api/medicamentos/search?q=paracetamol&ubicacion=Las%20Condes
router.get('/search', medicamentoController.buscarMedicamentos); // Nombre más general para la búsqueda

// --- Rutas CRUD Estándar ---

// GET /api/medicamentos - Obtener todos los medicamentos (o paginados, etc.)
router.get('/', medicamentoController.getMedicamentos);

// GET /api/medicamentos/:id - Obtener un medicamento por su ID
// Esta debe ir DESPUÉS de cualquier ruta que use un slug o una palabra fija como 'search'
router.get('/:id', medicamentoController.getMedicamentoById);

// POST /api/medicamentos - Crear un nuevo medicamento
router.post('/', medicamentoController.createMedicamento);

// PUT /api/medicamentos/:id - Actualizar un medicamento existente por su ID
router.put('/:id', medicamentoController.updateMedicamento);

// DELETE /api/medicamentos/:id - Eliminar un medicamento por su ID
router.delete('/:id', medicamentoController.deleteMedicamento);


module.exports = router; // Asegúrate de que no haya un espacio extra aquí