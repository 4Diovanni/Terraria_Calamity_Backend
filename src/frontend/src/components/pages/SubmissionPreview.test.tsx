import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SubmissionPreview } from './SubmissionPreview';
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
  flavorText: 'Forjada nas profundezas.',
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

describe('SubmissionPreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the proposed weapon immediately for CREATE submissions', async () => {
    render(<SubmissionPreview submission={createSubmission} />);
    expect(
      await screen.findByRole('heading', { name: 'Iron Shortsword Reforjada', level: 1 })
    ).toBeInTheDocument();
    expect(weaponService.getWeaponById).not.toHaveBeenCalled();
  });

  it('merges the target weapon metadata (flavor text) for UPDATE submissions', async () => {
    vi.mocked(weaponService.getWeaponById).mockResolvedValue(currentWeapon);
    render(<SubmissionPreview submission={updateSubmission} />);

    expect(
      await screen.findByRole('heading', { name: 'Iron Shortsword Reforjada', level: 1 })
    ).toBeInTheDocument();
    expect(screen.getByText(/Forjada nas profundezas\./)).toBeInTheDocument();
  });

  it('falls back to proposed-only values when the target weapon is not found', async () => {
    vi.mocked(weaponService.getWeaponById).mockRejectedValue(new Error('404'));
    render(<SubmissionPreview submission={updateSubmission} />);

    expect(
      await screen.findByRole('heading', { name: 'Iron Shortsword Reforjada', level: 1 })
    ).toBeInTheDocument();
    expect(screen.queryByText(/Forjada nas profundezas\./)).not.toBeInTheDocument();
  });
});
