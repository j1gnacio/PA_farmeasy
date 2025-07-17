const Farmacia = require('../models/Farmacia');
const Ubicacion = require('../models/Ubicacion'); // Necesario para crear/actualizar farmacias con ubicación

// @desc    Obtener todas las farmacias
// @route   GET /api/farmacias
// @access  Public
exports.getAllFarmacias = async (req, res) => { // Usando tu nombre
    try {
        const farmacias = await Farmacia.find({}).populate('ubicacion'); // Populate para obtener detalles de la ubicación
        res.status(200).json(farmacias);
    } catch (err) { // Cambié a 'err' por consistencia, pero 'error' funciona
        res.status(500).json({ message: err.message });
    }
};

// @desc    Obtener una farmacia por ID
// @route   GET /api/farmacias/:id
// @access  Public
exports.getFarmaciaById = async (req, res) => {
    try {
        const farmacia = await Farmacia.findById(req.params.id).populate('ubicacion');
        if (!farmacia) {
            return res.status(404).json({ message: 'Farmacia no encontrada' });
        }
        res.status(200).json(farmacia);
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'ID de farmacia inválido' });
        }
        res.status(500).json({ message: err.message });
    }
};

// @desc    Crear una nueva farmacia
// @route   POST /api/farmacias
// @access  Public
exports.createFarmacia = async (req, res) => {
    const { nombre, direccion, ciudad, urlBaseScraper, horario, telefono, sitioWeb } = req.body; // Añadiendo horario, telefono, sitioWeb

    try {
        // Primero, intentar encontrar o crear la ubicación
        let ubicacion = await Ubicacion.findOne({ direccion, ciudad });
        if (!ubicacion) {
            ubicacion = await Ubicacion.create({ direccion, ciudad });
        }

        const newFarmacia = new Farmacia({
            nombre,
            ubicacion: ubicacion._id, // Usar el ID de la ubicación
            urlBaseScraper,
            horario, // Añadiendo horario
            telefono, // Añadiendo telefono
            sitioWeb // Añadiendo sitioWeb
        });
        const farmaciaGuardada = await newFarmacia.save();
        res.status(201).json(farmaciaGuardada);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: 'Ya existe una farmacia con ese nombre.' });
        }
        res.status(400).json({ message: err.message });
    }
};

// @desc    Actualizar una farmacia
// @route   PUT /api/farmacias/:id
// @access  Public
exports.updateFarmacia = async (req, res) => {
    const { id } = req.params;
    const { nombre, direccion, ciudad, urlBaseScraper, horario, telefono, sitioWeb } = req.body; // Añadiendo campos de contacto

    try {
        let ubicacionId;
        if (direccion && ciudad) { // Si se proporcionan dirección y ciudad, se busca/crea la ubicación
            let ubicacion = await Ubicacion.findOne({ direccion, ciudad });
            if (!ubicacion) {
                ubicacion = await Ubicacion.create({ direccion, ciudad });
            }
            ubicacionId = ubicacion._id;
        }

        const farmacia = await Farmacia.findById(id);
        if (!farmacia) {
            return res.status(404).json({ message: 'Farmacia no encontrada' });
        }

        // Actualizar campos si se proporcionan en el body
        farmacia.nombre = nombre !== undefined ? nombre : farmacia.nombre;
        farmacia.urlBaseScraper = urlBaseScraper !== undefined ? urlBaseScraper : farmacia.urlBaseScraper;
        farmacia.horario = horario !== undefined ? horario : farmacia.horario;
        farmacia.telefono = telefono !== undefined ? telefono : farmacia.telefono;
        farmacia.sitioWeb = sitioWeb !== undefined ? sitioWeb : farmacia.sitioWeb;

        if (ubicacionId) { // Solo actualizar la ubicación si se proporcionaron direccion y ciudad
            farmacia.ubicacion = ubicacionId;
        }

        // Mongoose pre-save middleware se encargará de 'updatedAt'
        const farmaciaActualizada = await farmacia.save();

        // Populate la ubicación en la respuesta final
        await farmaciaActualizada.populate('ubicacion');

        res.status(200).json(farmaciaActualizada);
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'ID de farmacia inválido' });
        }
        if (err.code === 11000) {
            return res.status(409).json({ message: 'Ya existe una farmacia con ese nombre.' });
        }
        res.status(400).json({ message: err.message });
    }
};

// @desc    Eliminar una farmacia
// @route   DELETE /api/farmacias/:id
// @access  Public
exports.deleteFarmacia = async (req, res) => {
    try {
        const farmaciaEliminada = await Farmacia.findByIdAndDelete(req.params.id);
        if (!farmaciaEliminada) {
            return res.status(404).json({ message: 'Farmacia no encontrada' });
        }
        res.status(200).json({ message: 'Farmacia eliminada exitosamente' });
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'ID de farmacia inválido' });
        }
        res.status(500).json({ message: err.message });
    }
};