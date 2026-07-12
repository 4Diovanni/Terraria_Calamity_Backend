import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSubmissionTargetWeapon } from './useSubmissionTargetWeapon';
import { weaponService } from '../services/weaponService';
import { WeaponSubmission } from '../types/weaponSubmission';
import { WeaponTypeClass, Element } from '../types/weapon';

vi.mock('../services/weaponService', () => ({
  weaponService: { getWeaponById: vi.fn() },
}));

const baseSubmission: WeaponSubmission = {
  id: '1',
  type: 'UPDATE',
  status: 'PENDING',
  submittedByUsername: 'arcanjo',
  targetWeaponId: '3',
  name: 'Iron Shortsword Reforjada',
  weaponClass: WeaponTypeClass.MELEE,
  element: Element.NEUTRAL,
  baseDamage: 12,
  criticalChance: 4,
  attacksPerTurn: 1.6,
  range: 46,
  rarity: 0,
  price: 120,
  quality: 2,
  abilities: '',
  description: 'Arma de ferro',
  imageUrl: '',
  rejectionReason: null,
  createdAt: '2024-01-02T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
};

describe('useSubmissionTargetWeapon', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not fetch and starts with loading=false for CREATE submissions', () => {
    const { result } = renderHook(() =>
      useSubmissionTargetWeapon({ ...baseSubmission, type: 'CREATE', targetWeaponId: null })
    );
    expect(result.current.loading).toBe(false);
    expect(weaponService.getWeaponById).not.toHaveBeenCalled();
  });

  it('does not fetch and starts with loading=false for UPDATE without a targetWeaponId', () => {
    const { result } = renderHook(() =>
      useSubmissionTargetWeapon({ ...baseSubmission, targetWeaponId: null })
    );
    expect(result.current.loading).toBe(false);
    expect(weaponService.getWeaponById).not.toHaveBeenCalled();
  });

  it('fetches the target weapon for UPDATE and exposes it once loaded', async () => {
    vi.mocked(weaponService.getWeaponById).mockResolvedValue({
      ...baseSubmission,
      id: '3',
    } as never);

    const { result } = renderHook(() => useSubmissionTargetWeapon(baseSubmission));
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.weapon).not.toBeNull();
    expect(result.current.notFound).toBe(false);
    expect(weaponService.getWeaponById).toHaveBeenCalledWith('3');
  });

  it('sets notFound when the fetch fails', async () => {
    vi.mocked(weaponService.getWeaponById).mockRejectedValue(new Error('404'));

    const { result } = renderHook(() => useSubmissionTargetWeapon(baseSubmission));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.notFound).toBe(true);
    expect(result.current.weapon).toBeNull();
  });
});
