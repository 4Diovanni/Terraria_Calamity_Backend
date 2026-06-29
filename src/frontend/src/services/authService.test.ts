import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import apiClient from './apiClient';
import { authService } from './authService';
import type { AuthResponse } from '../types/auth';

describe('authService', () => {
  let mock: MockAdapter;

  const mockAuthResponse: AuthResponse = {
    token: 'eyJhbGciOiJIUzM4NCJ9.payload.signature',
    type: 'Bearer',
    username: 'testuser',
    email: 'test@example.com',
    role: 'USER',
  };

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.restore();
  });

  describe('login', () => {
    it('posts to /api/v1/auth/login and returns AuthResponse', async () => {
      mock.onPost('/api/v1/auth/login').reply(200, mockAuthResponse);

      const result = await authService.login({ email: 'test@example.com', password: 'secret' });

      expect(mock.history.post[0].url).toBe('/api/v1/auth/login');
      expect(JSON.parse(mock.history.post[0].data)).toEqual({
        email: 'test@example.com',
        password: 'secret',
      });
      expect(result).toEqual(mockAuthResponse);
    });

    it('propagates 400 errors from the API', async () => {
      mock.onPost('/api/v1/auth/login').reply(400, { message: 'Validation error' });

      await expect(
        authService.login({ email: 'bad', password: '' })
      ).rejects.toMatchObject({ status: 400 });
    });

    it('propagates 401 errors without redirecting (interceptor skip)', async () => {
      mock.onPost('/api/v1/auth/login').reply(401, { message: 'Bad credentials' });

      await expect(
        authService.login({ email: 'x@x.com', password: 'wrong' })
      ).rejects.toMatchObject({ status: 401 });
    });
  });

  describe('register', () => {
    it('posts to /api/v1/auth/register and returns AuthResponse on 201', async () => {
      mock.onPost('/api/v1/auth/register').reply(201, mockAuthResponse);

      const result = await authService.register({
        username: 'testuser',
        email: 'test@example.com',
        password: 'secret',
      });

      expect(mock.history.post[0].url).toBe('/api/v1/auth/register');
      expect(JSON.parse(mock.history.post[0].data)).toEqual({
        username: 'testuser',
        email: 'test@example.com',
        password: 'secret',
      });
      expect(result).toEqual(mockAuthResponse);
    });

    it('propagates 409 errors from the API', async () => {
      mock.onPost('/api/v1/auth/register').reply(409, { message: 'Duplicate' });

      await expect(
        authService.register({ username: 'u', email: 'x@x.com', password: 'p' })
      ).rejects.toMatchObject({ status: 409 });
    });
  });
});
