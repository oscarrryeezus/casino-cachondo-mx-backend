import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { jugarBlackjack } from './blackjackController';
import User from '../models/User';

let mongoServer;
let app;

async function crearUsuario(fondos) {
  return await User.create({
    nombre: 'Test User',
    email: `test${Math.random()}@example.com`, 
    password: '12345678',
    fondos,
    historial: []
  });
}

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { dbName: 'test' });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  vi.restoreAllMocks();
});

beforeEach(async () => {
  app = express();
  app.use(express.json());

  app.post('/blackjack', jugarBlackjack);
  await User.deleteMany({});
});

describe('jugarBlackjack controller', () => {
  it('retorna 400 si datos inválidos', async () => {
    const res = await request(app)
      .post('/blackjack')
      .send({ userId: '', apuesta: 10, resultado: 'invalid' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Datos inválidos.');
  });

  it('retorna 400 si fondos insuficientes para perder', async () => {
    const user = await crearUsuario(5);

    const res = await request(app)
      .post('/blackjack')
      .send({ userId: user._id, apuesta: 10, resultado: 'perdido' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Fondos insuficientes.');
  });

  it('retorna 404 si el usuario no existe', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .post('/blackjack')
      .send({ userId: fakeId, apuesta: 10, resultado: 'ganado' });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Usuario no encontrado');
  });

  it('actualiza fondos correctamente cuando gana', async () => {
    const user = await crearUsuario(100);

    const res = await request(app)
      .post('/blackjack')
      .send({ userId: user._id, apuesta: 20, resultado: 'ganado' });

    expect(res.status).toBe(200);
    expect(res.body.fondos).toBe(120);
  });

  it('actualiza fondos correctamente cuando pierde', async () => {
    const user = await crearUsuario(100);

    const res = await request(app)
      .post('/blackjack')
      .send({ userId: user._id, apuesta: 30, resultado: 'perdido' });

    expect(res.status).toBe(200);
    expect(res.body.fondos).toBe(70); 
  });

  it('no cambia fondos en empate', async () => {
    const user = await crearUsuario(100);

    const res = await request(app)
      .post('/blackjack')
      .send({ userId: user._id, apuesta: 40, resultado: 'empate' });

    expect(res.status).toBe(200);
    expect(res.body.fondos).toBe(100);
  });
});
