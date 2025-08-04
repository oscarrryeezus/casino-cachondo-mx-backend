const modelo = require('../models/User')

const user_controller = {
    createUser: async (req, res) => {
        try {
            const usuario = new modelo(req.body)
            const usuarioCreated = await usuario.save();
                res.status(200).json({usuarioCreated, message: "Usuario creado exitosamente"})
        } catch (error) {
            res.status(500).json({
                message: "Error al crear el usuario",
                error: error.details
            })
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




module.exports = user_controller;