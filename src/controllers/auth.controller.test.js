import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

import { login, logout } from './auth.controller';
import User from '../models/User';

let mongoServer;
let app;

async function crearUsuario(password) {
  const user = new User({
    nombre: 'Test User',
    email: `test${Math.random()}@example.com`,
    password,
    fondos: 100,
    role: 'user'
  });
  await user.save();
  return user;
}

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { dbName: 'test' });
  vi.spyOn(jwt, 'sign').mockImplementation(() => 'token-fake');
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  vi.restoreAllMocks();
});

beforeEach(async () => {
  app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.post('/login', login);
  app.post('/logout', logout);
  await User.deleteMany({});
});

describe('Auth controller', () => {
  it('login - retorna 401 si usuario no existe', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'noexiste@example.com', password: '12345678' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Credenciales incorrectas');
  });

  it('login - retorna 401 si contraseña incorrecta', async () => {
    const user = await crearUsuario('correctpassword');

    const res = await request(app)
      .post('/login')
      .send({ email: user.email, password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Credenciales incorrectas');
  });

  it('login - retorna 200 y token en cookie si éxito', async () => {
    const password = 'correctpassword';
    const user = await crearUsuario(password);

    vi.spyOn(user, 'comparePassword').mockResolvedValue(true);

    const res = await request(app)
      .post('/login')
      .send({ email: user.email, password });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Autenticación exitosa');
    expect(res.body.user.email).toBe(user.email);
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.headers['set-cookie'][0]).toContain('token=token-fake');
  });

  it('logout - limpia cookie y retorna 200', async () => {
    const res = await request(app)
      .post('/logout');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Sesión cerrada');
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.headers['set-cookie'][0]).toMatch(/token=;/);
  });
});
