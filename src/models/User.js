const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const TarjetaSchema = new mongoose.Schema({
    numero: {
        type: String,
        required: true
    },
    mm: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    yyyy: {
        type: Number,
        required: true,
        min: 2026
    },
    cvv: {
        type: Number,
        required: true,
        min: 100,
        max: 999
    }
}, { _id: false })

const HistorialSchema = new mongoose.Schema({
    juego: {
        type: String,
        required: true
    },
    monto: {
        type: Number,
        required: true
    }
}, { _id: false })

const UserSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, "El nombre es requerido"],
        trim: true
    },
    role: {
        type: String,
        required: [true, "El rol es requerido"],
        enum: ['admin', 'user'],
        default: 'user',
        trim: true
    },
    email: {
        type: String,
        required: [true, 'El email es requerido'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Ingrese un email válido']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es requerida'],
        minLength: [8, 'La contraseña debe tener al menos 8 caracteres'],
        match: [
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.,:;#^_~\-+])[A-Za-z\d@$!%*?&.,:;#^_~\-+]{8,}$/,
            'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, un número y un símbolo especial'
        ],
        select: false
    },
    fondos: {
        type: Number,
        default: 0
    },
    tarjetas: [TarjetaSchema],
    historial: [HistorialSchema]
}, { timestamps: true, versionKey: false })

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    try {
        const salt = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password, salt)
        next()
    } catch (error) {
        next(error)
    }
})

UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.model('User', UserSchema)
