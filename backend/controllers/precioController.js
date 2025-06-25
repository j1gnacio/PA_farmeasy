const PrecioMedicamento = require('../models/PrecioMedicamento');

// Obtener precios de un medicamento específico, quizás por farmacia
exports.getPreciosPorMedicamento = async (req, res) => {
    try {
        const precios = await PrecioMedicamento.find({ medicamento: req.params.medicamentoId })
            .populate('farmacia', 'nombre direccion') // Popula la información de la farmacia
            .sort({ precio: 1 }); // Ordena por precio ascendente
        res.json(precios);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Añadir un precio (usado principalmente por el scraper)
exports.addPrecio = async (req, res) => {
    const { medicamento, farmacia, precio } = req.body; // Se esperan los IDs de medicamento y farmacia
    const nuevoPrecio = new PrecioMedicamento({ medicamento, farmacia, precio });
    try {
        const precioGuardado = await nuevoPrecio.save();
        res.status(201).json(precioGuardado);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Actualizar un precio existente (ej: si el scraper encuentra un precio más reciente)
exports.updatePrecio = async (req, res) => {
    try {
        const { id } = req.params;
        const { precio, fechaActualizacion } = req.body;
        const updatedPrice = await PrecioMedicamento.findByIdAndUpdate(
            id,
            { precio, fechaActualizacion: fechaActualizacion || Date.now() },
            { new: true } // Retorna el documento actualizado
        );
        if (!updatedPrice) {
            return res.status(404).json({ message: 'Precio no encontrado' });
        }
        res.json(updatedPrice);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};