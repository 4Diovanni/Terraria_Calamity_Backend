import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import apiClient, { onRetry } from './apiClient';

describe('apiClient cold-start retry', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    vi.useFakeTimers();
  });

  afterEach(() => {
    mock.restore();
    onRetry(null);
    vi.useRealTimers();
  });

  it('retries a timed-out request instead of failing immediately', async () => {
    mock
      .onGet('/api/v1/weapons')
      .timeoutOnce()
      .onGet('/api/v1/weapons')
      .reply(200, [{ id: '1', name: 'Terra Blade' }]);

    const requestPromise = apiClient.get('/api/v1/weapons');
    await vi.runAllTimersAsync();
    const response = await requestPromise;

    expect(response.status).toBe(200);
    expect(response.data).toEqual([{ id: '1', name: 'Terra Blade' }]);
  });

  it('notifies a retry listener with attempt count before retrying', async () => {
    const listener = vi.fn();
    onRetry(listener);

    mock
      .onGet('/api/v1/weapons')
      .timeoutOnce()
      .onGet('/api/v1/weapons')
      .reply(200, []);

    const requestPromise = apiClient.get('/api/v1/weapons');
    await vi.runAllTimersAsync();
    await requestPromise;

    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ attempt: 1, maxRetries: 3 })
    );
  });

  it('gives up after exceeding the maximum retry count', async () => {
    mock.onGet('/api/v1/weapons').timeout();

    const requestPromise = apiClient.get('/api/v1/weapons').catch((e) => e);
    await vi.runAllTimersAsync();
    const error = await requestPromise;

    expect(mock.history.get.length).toBe(4); // 1 initial + 3 retries
    expect(error.message).toMatch(/timeout/i);
  });

  it('does not retry non-network errors like 404', async () => {
    mock.onGet('/api/v1/weapons/missing').reply(404);

    const requestPromise = apiClient.get('/api/v1/weapons/missing').catch((e) => e);
    await vi.runAllTimersAsync();
    await requestPromise;

    expect(mock.history.get.length).toBe(1);
  });
});

describe('apiClient error handling', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.restore();
  });

  it('surfaces the backend message on 409 responses', async () => {
    mock
      .onPost('/api/v1/weapons')
      .reply(409, { status: 409, message: 'Ja existe uma submissao pendente para esta arma' });

    const error = await apiClient.post('/api/v1/weapons', {}).catch((e) => e);

    expect(error.status).toBe(409);
    expect(error.message).toBe('Ja existe uma submissao pendente para esta arma');
  });

  it('falls back to a generic message when the 409 response has no body message', async () => {
    mock.onDelete('/api/v1/weapons/1').reply(409, {});

    const error = await apiClient.delete('/api/v1/weapons/1').catch((e) => e);

    expect(error.status).toBe(409);
    expect(error.message).toBe('Conflito ao processar a solicitação.');
  });
});
