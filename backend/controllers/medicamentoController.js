const Medicamento = require('../models/Medicamento');
const Farmacia = require('../models/Farmacia');
const PrecioMedicamento = require('../models/PrecioMedicamento');

// Obtener todos los medicamentos
exports.getMedicamentos = async (req, res) => {
    try {
        const medicamentos = await Medicamento.find();
        res.json(medicamentos);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};

// Obtener un medicamento por ID
exports.getMedicamentoById = async (req, res) => {
    try {
        const medicamento = await Medicamento.findById(req.params.id);
        if (!medicamento) return res.status(404).json({ message: 'Medicamento no encontrado' });
        res.json(medicamento);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Crear un nuevo medicamento (para uso interno o admin)
exports.createMedicamento = async (req, res) => {
    const { nombre, laboratorio, presentacion, descripcion, imagenUrl } = req.body;
    const nuevoMedicamento = new Medicamento({ nombre, laboratorio, presentacion, descripcion, imagenUrl });
    try {
        const medicamentoGuardado = await nuevoMedicamento.save();
        res.status(201).json(medicamentoGuardado);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// ... Implementar updateMedicamento, deleteMedicamento