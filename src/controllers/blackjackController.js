const User = require('../models/User');

const jugarBlackjack = async (req, res) => {
  const { userId, resultado, apuesta } = req.body;

  if (!userId || !apuesta || !['ganado', 'perdido', 'empate'].includes(resultado)) {
    return res.status(400).json({ message: 'Datos inválidos.' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    if (user.fondos < apuesta && resultado === 'perdido') {
      return res.status(400).json({ message: 'Fondos insuficientes.' });
    }

    let nuevosFondos = user.fondos;

    if (resultado === 'ganado') {
      nuevosFondos += apuesta;
    } else if (resultado === 'perdido') {
      nuevosFondos -= apuesta;
    }

    user.fondos = nuevosFondos;

let montoHistorial = 0;

if (resultado === 'ganado') {
  montoHistorial = apuesta;
} else if (resultado === 'perdido') {
  montoHistorial = -apuesta;
}

user.historial.push({
  juego: 'blackjack',
  monto: montoHistorial
});


    await user.save();

    return res.json({ fondos: user.fondos });
  } catch (err) {
    console.error('Error en jugarBlackjack:', err);
    return res.status(500).json({ message: 'Error en el servidor', error: err.message });
  }
};

module.exports = { jugarBlackjack };
