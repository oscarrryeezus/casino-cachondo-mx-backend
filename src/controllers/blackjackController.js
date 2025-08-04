const User = require('../models/User');

const jugarBlackjack = async (req, res) => {
  const { userId, resultado, apuesta } = req.body;

  if (!userId || !apuesta || !['ganado', 'perdido', 'empate'].includes(resultado)) {
    return res.status(400).json({ message: 'Datos inválidos.' });
  }

  try {
    const monto = resultado === 'ganado'
      ? apuesta
      : resultado === 'perdido'
      ? -apuesta
      : 0;

    if (monto < 0) {
      const { fondos } = await User.findById(userId).select('fondos');
      if (fondos < apuesta) {
        return res.status(400).json({ message: 'Fondos insuficientes.' });
      }
    }

    const userActualizado = await User.findByIdAndUpdate(
      userId,
      {
        $inc: { fondos: monto },
        $push: {
          historial: {
            juego: 'blackjack',
            monto: monto
          }
        }
      },
      { new: true }
    );

    if (!userActualizado) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.json({ fondos: userActualizado.fondos });
  } catch (err) {
    console.error('Error en jugarBlackjack:', err);
    return res.status(500).json({ message: 'Error en el servidor', error: err.message });
  }
};

module.exports = { jugarBlackjack };