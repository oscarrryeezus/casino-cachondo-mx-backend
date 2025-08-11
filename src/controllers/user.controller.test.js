import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import userController from './user.controller';
import User from '../models/User';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { dbName: "test" });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('user_controller (integración)', () => {
  let app;

  beforeEach(async () => {
    app = express();
    app.use(express.json());
    app.use(cookieParser());

    // Endpoints para test
    app.post('/users', userController.createUser);
    app.post('/cards', async (req, res, next) => {
      let user = await User.findOne();
      if (!user) {
        user = await User.create({ nombre: 'Juan', email: 'juan@example.com', password: '12345678' });
      }
      req.user = { id: user._id };
      next();
    }, userController.addCard);

    await User.deleteMany({});
  });

  describe('createUser', () => {
    it('crea un usuario exitosamente', async () => {
      const fakeUser = { nombre: 'Juan', email: 'juan@example.com', password: '12345678' };

      const res = await request(app)
        .post('/users')
        .send(fakeUser);

      expect(res.status).toBe(200);
      expect(res.body.usuarioCreated._id).toBeDefined();
      expect(res.body.usuarioCreated.nombre).toBe(fakeUser.nombre);
      expect(res.body.usuarioCreated.email).toBe(fakeUser.email);
      expect(res.body.message).toBe('Usuario creado exitosamente');
    });

    it('devuelve 500 si hay un error al guardar', async () => {
      const res = await request(app)
        .post('/users')
        .send({ nombre: 'Juan', password: '12345678' });

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Error al crear el usuario');
    });
  });

  describe('addCard', () => {
    it('agrega una tarjeta correctamente', async () => {
      const user = await User.create({ nombre: 'Juan', email: 'juan2@example.com', password: '12345678' });

      const cardData = { numero: '4111111111111111', mm: 12, yyyy: 2026, cvv: 123 };

      const res = await request(app)
        .post('/cards')
        .send(cardData);

      expect(res.status).toBe(200);
      expect(res.body.tarjeta).toMatchObject({
        numero: cardData.numero,
        mm: cardData.mm,
        yyyy: cardData.yyyy,
        cvv: cardData.cvv
      });

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.tarjetas.length).toBe(1);
    });

    it('devuelve 401 si no hay usuario autenticado', async () => {
      const noAuthApp = express();
      noAuthApp.use(express.json());
      noAuthApp.post('/cards', userController.addCard);

      const res = await request(noAuthApp)
        .post('/cards')
        .send({ numero: '123' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Usuario no autenticado');
    });

  });
});
