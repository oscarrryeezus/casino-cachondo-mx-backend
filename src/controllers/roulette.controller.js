const User = require('../models/User')

const colors = ['rojo', 'negro', 'verde']

const roulette_controller = {
    spinRoulette: async (req, res) => {
        const { userId, apuesta, color, numero } = req.body

        const apuestaColor = color && ['rojo', 'negro', 'verde'].includes(color)
        const apuestaNumero = typeof Number(numero) === 'number' && Number(numero) >= 0 && Number(numero) <= 36

        if (!apuestaColor && !apuestaNumero) {
            return res.status(400).json({ error: 'Debes apostar por color, número o ambos' })
        }

        try {
            const user = await User.findById(userId)
            if (!user) return res.status(404).json({ error: 'Usuario no encontrado' })

            if (user.fondos < apuesta) {
                return res.status(400).json({ error: 'Fondos insuficientes' })
            }

            const ultimos = [...user.historial].slice(-6)

            const ganadasConsecutivas = ultimos.every(j => j.juego === 'ruleta' && j.monto > 0)

            // Simular ruleta real: 0-36 con color asignado
            const numeroGanador = Math.floor(Math.random() * 37)
            let colorGanador = 'verde'
            if (numeroGanador !== 0) {
                colorGanador = numeroGanador % 2 === 0 ? 'negro' : 'rojo'
            }

            let resultado = 'perdido'
            let premio = 0

            const aciertaNumero = apuestaNumero && numero === numeroGanador
            const aciertaColor = apuestaColor && color === colorGanador

            if (aciertaNumero) {
                resultado = 'ganado'
                premio = apuesta * 36
                user.fondos += premio
            } else if (aciertaColor) {
                resultado = 'ganado'
                premio = color === 'verde' ? apuesta * 14 : apuesta * 2
                user.fondos += premio
            } else {
                user.fondos -= apuesta
            }

            user.historial.push({
                juego: 'ruleta',
                monto: resultado === 'ganado' ? premio : -apuesta
            })

            await user.save()

            res.json({
                resultado: resultado,
                numeroGanador,
                colorGanador,
                acierto: {
                    numero: aciertaNumero,
                    color: aciertaColor
                },
                fondosActuales: user.fondos,
                montoGanado: resultado === 'ganado' ? premio : 0
            })
        } catch (err) {
            console.error(err)
            res.status(500).json({ error: 'Error en el servidor' })
        }
    }
}

module.exports = roulette_controller