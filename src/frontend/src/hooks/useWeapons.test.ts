import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useWeapons } from './useWeapons';
import { weaponService } from '../services/weaponService';
import { onRetry } from '../services/apiClient';

vi.mock('../services/weaponService', () => ({
  weaponService: {
    getAllWeapons: vi.fn(),
  },
}));

describe('useWeapons cold-start UX', () => {
  beforeEach(() => {
    vi.mocked(weaponService.getAllWeapons).mockReset();
    onRetry(null);
  });

  it('exposes a waking-up state while apiClient retries a cold start', async () => {
    let capturedListener: ((info: { attempt: number; maxRetries: number }) => void) | null =
      null;
    vi.spyOn(await import('../services/apiClient'), 'onRetry').mockImplementation((listener) => {
      capturedListener = listener as typeof capturedListener;
    });

    vi.mocked(weaponService.getAllWeapons).mockImplementation(
      () => new Promise(() => {}) // never resolves during this assertion window
    );

    const { result } = renderHook(() => useWeapons());

    await waitFor(() => expect(capturedListener).not.toBeNull());

    act(() => {
      capturedListener!({ attempt: 1, maxRetries: 3 });
    });

    expect(result.current.wakingUp).toBe(true);
    expect(result.current.retryAttempt).toEqual({ attempt: 1, maxRetries: 3 });
  });

  it('clears the waking-up state once weapons load successfully', async () => {
    vi.mocked(weaponService.getAllWeapons).mockResolvedValue([]);

    const { result } = renderHook(() => useWeapons());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.wakingUp).toBe(false);
  });
});
