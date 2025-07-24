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
    }
}

module.exports = user_controller;