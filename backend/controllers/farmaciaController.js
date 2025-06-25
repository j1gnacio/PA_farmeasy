// backend/controllers/farmaciaController.js
const Farmacia = require('../models/Farmacia');
const Ubicacion = require('../models/Ubicacion'); // Necesario para crear/actualizar farmacias con ubicación

// Obtener todas las farmacias
const getAllFarmacias = async (req, res) => {
    try {
        const farmacias = await Farmacia.find({}).populate('ubicacion'); // Populate para obtener detalles de la ubicación
        res.status(200).json(farmacias);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener una farmacia por ID
const getFarmaciaById = async (req, res) => {
    try {
        const farmacia = await Farmacia.findById(req.params.id).populate('ubicacion');
        if (!farmacia) {
            return res.status(404).json({ message: 'Farmacia no encontrada' });
        }
        res.status(200).json(farmacia);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Crear una nueva farmacia
const createFarmacia = async (req, res) => {
    const { nombre, direccion, ciudad, urlBaseScraper } = req.body;

    try {
        // Primero, intentar encontrar o crear la ubicación
        let ubicacion = await Ubicacion.findOne({ direccion, ciudad });
        if (!ubicacion) {
            ubicacion = await Ubicacion.create({ direccion, ciudad });
        }

        const newFarmacia = new Farmacia({
            nombre,
            ubicacion: ubicacion._id, // Usar el ID de la ubicación
            urlBaseScraper
        });
        const farmaciaGuardada = await newFarmacia.save();
        res.status(201).json(farmaciaGuardada);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Actualizar una farmacia
const updateFarmacia = async (req, res) => {
    const { id } = req.params;
    const { nombre, direccion, ciudad, urlBaseScraper } = req.body;

    try {
        let ubicacionId;
        if (direccion && ciudad) {
            let ubicacion = await Ubicacion.findOne({ direccion, ciudad });
            if (!ubicacion) {
                ubicacion = await Ubicacion.create({ direccion, ciudad });
            }
            ubicacionId = ubicacion._id;
        }

        const farmaciaActualizada = await Farmacia.findByIdAndUpdate(
            id,
            { nombre, ubicacion: ubicacionId, urlBaseScraper },
            { new: true, runValidators: true }
        ).populate('ubicacion');

        if (!farmaciaActualizada) {
            return res.status(404).json({ message: 'Farmacia no encontrada' });
        }
        res.status(200).json(farmaciaActualizada);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Eliminar una farmacia
const deleteFarmacia = async (req, res) => {
    try {
        const farmaciaEliminada = await Farmacia.findByIdAndDelete(req.params.id);
        if (!farmaciaEliminada) {
            return res.status(404).json({ message: 'Farmacia no encontrada' });
        }
        res.status(200).json({ message: 'Farmacia eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllFarmacias,
    getFarmaciaById,
    createFarmacia,
    updateFarmacia,
    deleteFarmacia
};