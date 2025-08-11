import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

// --- MOCK del modelo User ---
const mockUser = { _id: 'userId', nombre: 'Juan', email: 'juan@ejemplo.com' };

const createQueryMock = (returnValue) => {
  const query = {
    select: vi.fn().mockReturnThis(),
    then: (resolve) => resolve(returnValue)
  };
  return query;
};

const findByIdMock = vi.fn((id) => {
  if (id === 'userId') return createQueryMock(mockUser);
  return createQueryMock(null);
});

vi.mock('../models/User', () => ({
  findById: findByIdMock
}));

import authModule from './auth';
const auth = authModule.default || authModule;

describe('auth middleware', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(cookieParser());

    app.get('/protected', auth, (req, res) => {
      res.json({ ok: true, user: req.user });
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('responde 401 si no hay token', async () => {
    const res = await request(app).get('/protected');
    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ message: 'No autenticado' });
  });


  it('responde 401 Token inválido (JsonWebTokenError)', async () => {
    const verifySpy = vi.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new jwt.JsonWebTokenError('invalid token');
    });

    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer token-no-valido`);

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ message: 'Token inválido' });

    verifySpy.mockRestore();
  });

  it('responde 401 Token expirado (TokenExpiredError)', async () => {
    const expiredError = new jwt.TokenExpiredError('jwt expired', new Date());
    const verifySpy = vi.spyOn(jwt, 'verify').mockImplementation(() => { throw expiredError; });

    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer token-expirado`);

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ message: 'Token expirado' });

    verifySpy.mockRestore();
  });
});
