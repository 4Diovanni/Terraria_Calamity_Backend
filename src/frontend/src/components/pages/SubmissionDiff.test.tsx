import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SubmissionDiff } from './SubmissionDiff';
import { weaponService } from '../../services/weaponService';
import { WeaponSubmission } from '../../types/weaponSubmission';
import { Weapon, WeaponTypeClass, Element } from '../../types/weapon';

vi.mock('../../services/weaponService', () => ({
  weaponService: { getWeaponById: vi.fn() },
}));

const currentWeapon: Weapon = {
  id: '3',
  name: 'Iron Shortsword',
  weaponClass: WeaponTypeClass.MELEE,
  element: Element.NEUTRAL,
  baseDamage: 9,
  criticalChance: 4,
  attacksPerTurn: 1.6,
  range: 46,
  rarity: 0,
  price: 120,
  quality: 2,
  abilities: 'Melhor que cobre',
  description: 'Arma de ferro',
  imageUrl: 'img.png',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const updateSubmission: WeaponSubmission = {
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
  abilities: 'Melhor que cobre, agora com fio',
  description: 'Arma de ferro',
  imageUrl: 'img.png',
  rejectionReason: null,
  createdAt: '2024-01-02T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
};

const createSubmission: WeaponSubmission = {
  ...updateSubmission,
  id: '2',
  type: 'CREATE',
  targetWeaponId: null,
};

describe('SubmissionDiff', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders CREATE submissions immediately without fetching the current weapon', async () => {
    render(<SubmissionDiff submission={createSubmission} />);
    expect(await screen.findByText('Iron Shortsword Reforjada')).toBeInTheDocument();
    expect(weaponService.getWeaponById).not.toHaveBeenCalled();
  });

  it('shows a loading state while fetching the current weapon for UPDATE', () => {
    vi.mocked(weaponService.getWeaponById).mockReturnValue(new Promise(() => {}));
    render(<SubmissionDiff submission={updateSubmission} />);
    expect(screen.getByText('Carregando comparação...')).toBeInTheDocument();
  });

  it('renders the diff after fetching the current weapon successfully', async () => {
    vi.mocked(weaponService.getWeaponById).mockResolvedValue(currentWeapon);
    render(<SubmissionDiff submission={updateSubmission} />);

    expect(await screen.findByText('Iron Shortsword Reforjada')).toBeInTheDocument();
    expect(screen.getByText('Iron Shortsword')).toBeInTheDocument();
    expect(weaponService.getWeaponById).toHaveBeenCalledWith('3');
  });

  it('falls back to showing proposed values when the current weapon cannot be found', async () => {
    vi.mocked(weaponService.getWeaponById).mockRejectedValue(new Error('404'));
    render(<SubmissionDiff submission={updateSubmission} />);

    expect(await screen.findByText(/Arma original não encontrada/)).toBeInTheDocument();
    expect(screen.getByText('Iron Shortsword Reforjada')).toBeInTheDocument();
  });

  it('renders UPDATE submission immediately when targetWeaponId is null (no loading state)', async () => {
    const updateSubmissionNoTarget: WeaponSubmission = {
      ...updateSubmission,
      targetWeaponId: null,
    };
    render(<SubmissionDiff submission={updateSubmissionNoTarget} />);

    expect(await screen.findByText('Iron Shortsword Reforjada')).toBeInTheDocument();
    expect(screen.queryByText('Carregando comparação...')).not.toBeInTheDocument();
    expect(weaponService.getWeaponById).not.toHaveBeenCalled();
  });
});
