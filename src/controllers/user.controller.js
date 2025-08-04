const User = require('../models/User')
const { v4: uuidv4 } = require('uuid');

const user_controller = {
    createUser: async (req, res) => {
        try {
            const usuario = new User(req.body)
            const usuarioCreated = await usuario.save();
                res.status(200).json({usuarioCreated, message: "Usuario creado exitosamente"})
        } catch (error) {
            res.status(500).json({
                message: "Error al crear el usuario",
                error: error.details
            })
        }
    },

feature-saldo-back
    addCard: async (req, res) => {
    try {
        const { numero, mm, yyyy, cvv } = req.body;

        const userId = req.user?.id;

        if (!userId) {
        return res.status(401).json({ message: "Usuario no autenticado" });
        }

        const user = await User.findById(userId);
        if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const nuevaCard = { id: uuidv4(), numero, mm, yyyy, cvv };
        user.tarjetas.push(nuevaCard);
        await user.save();

        res.status(200).json({ tarjeta: nuevaCard });

    } catch (err) {
        console.error("Error en addCard:", err);
        res.status(500).json({ message: 'Error agregando tarjeta', error: err.message });
    }
    },


  getUserFundsById: async (req, res) => {
    const { id } = req.params;

    try {
      const user = await modelo.findById(id).select('fondos');

      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      res.status(200).json({ fondos: user.fondos });
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener los fondos',
        error: error.message
      });
    }
  }
}


  getCards: async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId).select('tarjetas');
      res.status(200).json({ tarjetas: user.tarjetas });
    } catch (err) {
      res.status(500).json({ message: 'Error obteniendo tarjetas', error: err.message });
    }
  },

  payAndAddBalance: async (req, res) => {
    try {
      const { cardId, amount } = req.body;
      const userId = req.user.id;
      const user = await User.findById(userId);
      const card = user.tarjetas.find(t => t.id === cardId);
      if (!card) return res.status(400).json({ message: 'Tarjeta no encontrada' });
      user.fondos += amount;
      user.historialD.push({ tipo: 'deposito', monto: amount });
      await user.save();
      res.status(200).json({ fondos: user.fondos, historial: user.historialD });
    } catch (err) {
      res.status(500).json({ message: 'Error en pago', error: err.message });
    }
  }
}


module.exports = user_controller;