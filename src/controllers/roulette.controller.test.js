import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import rouletteController from './roulette.controller';
import User from '../models/User';

vi.spyOn(global.Math, 'random').mockReturnValue(0.5);

let mongoServer;
let app;

async function crearUsuario(fondos) {
  return await User.create({
    nombre: 'Test User',
    email: 'test@example.com',
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

  app.post('/roulette', rouletteController.spinRoulette);
  await User.deleteMany({});
});

describe('roulette_controller.spinRoulette', () => {

  it('retorna 400 si la apuesta no es válida', async () => {
    const res = await request(app)
      .post('/roulette')
      .send({ userId: 'fake', apuesta: 100 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Debes apostar por color, número o ambos');
  });

  it('retorna 404 si el usuario no existe', async () => {
    const res = await request(app)
      .post('/roulette')
      .send({ userId: new mongoose.Types.ObjectId(), apuesta: 50, color: 'rojo' });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Usuario no encontrado');
  });

  it('retorna 400 si el usuario no tiene fondos suficientes', async () => {
    const user = await crearUsuario(10);

    const res = await request(app)
      .post('/roulette')
      .send({ userId: user._id, apuesta: 50, color: 'rojo' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Fondos insuficientes');
  });

  it('gana por número', async () => {
    vi.spyOn(global.Math, 'random').mockReturnValue(18 / 37);

    const user = await crearUsuario(100);

    const res = await request(app)
      .post('/roulette')
      .send({ userId: user._id, apuesta: 10, numero: 18 });

    expect(res.status).toBe(200);
    expect(res.body.resultado).toBe('ganado');
    expect(res.body.fondosActuales).toBe(100 + (10 * 36));
  });

  it('gana por color', async () => {
    vi.spyOn(global.Math, 'random').mockReturnValue(4 / 37);

    const user = await crearUsuario(100);

    const res = await request(app)
      .post('/roulette')
      .send({ userId: user._id, apuesta: 10, color: 'negro' });

    expect(res.status).toBe(200);
    expect(res.body.resultado).toBe('ganado');
    expect(res.body.fondosActuales).toBe(100 + (10 * 2));
  });

  it('pierde la apuesta', async () => {
    vi.spyOn(global.Math, 'random').mockReturnValue(5 / 37);

    const user = await crearUsuario(100);

    const res = await request(app)
      .post('/roulette')
      .send({ userId: user._id, apuesta: 10, color: 'negro' });

    expect(res.status).toBe(200);
    expect(res.body.resultado).toBe('perdido');
    expect(res.body.fondosActuales).toBe(90);
  });

});
