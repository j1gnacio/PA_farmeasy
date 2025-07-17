// backend/controllers/medicamentoController.js
const Medicamento = require('../models/Medicamento');
// Estas líneas SÍ son necesarias en este controlador para la función de búsqueda
const Farmacia = require('../models/Farmacia');
const PrecioMedicamento = require('../models/PrecioMedicamento');

// @desc    Obtener todos los medicamentos
// @route   GET /api/medicamentos
// @access  Public
exports.getMedicamentos = async (req, res) => {
    try {
        const medicamentos = await Medicamento.find();
        res.json(medicamentos);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Obtener un medicamento por ID
// @route   GET /api/medicamentos/:id
// @access  Public
exports.getMedicamentoById = async (req, res) => {
    try {
        const medicamento = await Medicamento.findById(req.params.id);
        if (!medicamento) {
            return res.status(404).json({ message: 'Medicamento no encontrado' });
        }
        res.json(medicamento);
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'ID de medicamento inválido' });
        }
        res.status(500).json({ message: err.message });
    }
};

// @desc    Crear un nuevo medicamento (para uso interno o admin)
// @route   POST /api/medicamentos
// @access  Public (por ahora, luego se puede restringir con autenticación)
exports.createMedicamento = async (req, res) => {
    const { nombre, laboratorio, presentacion, descripcion, imagenUrl } = req.body;

    const nuevoMedicamento = new Medicamento({
        nombre,
        laboratorio,
        presentacion,
        descripcion,
        imagenUrl
    });

    try {
        const medicamentoGuardado = await nuevoMedicamento.save();
        res.status(201).json(medicamentoGuardado);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: 'Ya existe un medicamento con ese nombre.' });
        }
        res.status(400).json({ message: err.message });
    }
};

// @desc    Actualizar un medicamento
// @route   PUT /api/medicamentos/:id
// @access  Public (por ahora, luego se puede restringir)
exports.updateMedicamento = async (req, res) => {
    try {
        const medicamento = await Medicamento.findById(req.params.id);
        if (!medicamento) {
            return res.status(404).json({ message: 'Medicamento no encontrado' });
        }

        medicamento.nombre = req.body.nombre !== undefined ? req.body.nombre : medicamento.nombre;
        medicamento.descripcion = req.body.descripcion !== undefined ? req.body.descripcion : medicamento.descripcion;
        medicamento.laboratorio = req.body.laboratorio !== undefined ? req.body.laboratorio : medicamento.laboratorio;
        medicamento.presentacion = req.body.presentacion !== undefined ? req.body.presentacion : medicamento.presentacion;
        medicamento.imagenUrl = req.body.imagenUrl !== undefined ? req.body.imagenUrl : medicamento.imagenUrl;

        const medicamentoActualizado = await medicamento.save();
        res.json(medicamentoActualizado);
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'ID de medicamento inválido' });
        }
        if (err.code === 11000) {
            return res.status(409).json({ message: 'Ya existe un medicamento con ese nombre.' });
        }
        res.status(400).json({ message: err.message });
    }
};

// @desc    Eliminar un medicamento
// @route   DELETE /api/medicamentos/:id
// @access  Public (por ahora, luego se puede restringir)
exports.deleteMedicamento = async (req, res) => {
    try {
        const medicamento = await Medicamento.findByIdAndDelete(req.params.id);
        if (!medicamento) {
            return res.status(404).json({ message: 'Medicamento no encontrado' });
        }
        res.json({ message: 'Medicamento eliminado correctamente' });
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'ID de medicamento inválido' });
        }
        res.status(500).json({ message: err.message });
    }
};

// @desc    Buscar medicamentos por nombre y/o ubicación
// @route   GET /api/medicamentos/search?q=<nombre>&ubicacion=<ubicacion_farmacia>
// @access  Public
exports.buscarMedicamentos = async (req, res) => {
    try {
        const { q, ubicacion } = req.query; // 'q' para el nombre del medicamento, 'ubicacion' para la farmacia

        let queryMedicamento = {};
        if (q) {
            queryMedicamento.nombre = { $regex: q, $options: 'i' }; // Búsqueda de nombre insensible a mayúsculas/minúsculas
        }

        const medicamentos = await Medicamento.find(queryMedicamento);

        if (medicamentos.length === 0) {
            return res.status(404).json({ message: 'No se encontraron medicamentos con esos criterios.' });
        }

        const resultados = await Promise.all(medicamentos.map(async (medicamento) => {
            let preciosQuery = { medicamento: medicamento._id };
            let farmaciaFiltrada = null;

            if (ubicacion) {
                // Si se especificó una ubicación, primero encontrar la farmacia por su ubicación
                // Se busca por el campo 'Ubicacion' en el modelo Farmacia
                farmaciaFiltrada = await Farmacia.findOne({ Ubicacion: { $regex: ubicacion, $options: 'i' } });

                if (farmaciaFiltrada) {
                    preciosQuery.farmacia = farmaciaFiltrada._id;
                } else {
                    // Si no se encuentra la farmacia para la ubicación, no habrá precios para mostrar de esa ubicación.
                    // Se retorna un objeto vacío para este medicamento en esta ubicación
                    return {
                        id: medicamento._id,
                        nombre: medicamento.nombre,
                        imagenUrl: medicamento.imagenUrl,
                        preciosPorFarmacia: [] // Vacío si no hay farmacia para la ubicación
                    };
                }
            }

            const precios = await PrecioMedicamento.find(preciosQuery)
                .populate('farmacia', 'nombre Ubicacion') // Trae el nombre y la ubicación de la farmacia
                .sort({ precio: 1 }); // Ordenar por precio ascendente

            return {
                id: medicamento._id,
                nombre: medicamento.nombre,
                imagenUrl: medicamento.imagenUrl,
                preciosPorFarmacia: precios.map(p => ({
                    farmacia: p.farmacia.nombre,
                    ubicacionFarmacia: p.farmacia.Ubicacion, // Incluye la ubicación de la farmacia
                    precio: p.precio,
                    precioNormal: p.precioNormal, // Asegúrate de que este campo esté en tu modelo y se capture del scraper
                    fechaActualizacion: p.fechaActualizacion
                }))
            };
        }));

        // Filtrar resultados para eliminar medicamentos que no tuvieron precios
        // (especialmente si se especificó una ubicación y no se encontró en esa farmacia)
        const resultadosFiltrados = resultados.filter(r => r.preciosPorFarmacia.length > 0);

        if (resultadosFiltrados.length === 0) {
            // Mensaje más específico si no hay resultados después de filtrar
            let msg = 'No se encontraron resultados.';
            if (q) msg += ` para "${q}"`;
            if (ubicacion) msg += ` en la ubicación "${ubicacion}"`;
            return res.status(404).json({ message: msg });
        }

        res.json(resultadosFiltrados);
    } catch (error) {
        console.error('Error en buscarMedicamentos:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};