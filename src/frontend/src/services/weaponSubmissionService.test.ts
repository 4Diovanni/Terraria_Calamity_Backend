import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import apiClient from './apiClient';
import { weaponSubmissionService } from './weaponSubmissionService';
import { WeaponSubmission, WeaponSubmissionRequest } from '../types/weaponSubmission';
import { WeaponTypeClass, Element } from '../types/weapon';

const BASE_URL = '/api/v1/weapon-submissions';

const sampleSubmission: WeaponSubmission = {
  id: '1',
  type: 'CREATE',
  status: 'PENDING',
  submittedByUsername: 'arcanjo',
  targetWeaponId: null,
  name: 'Terra Blade',
  weaponClass: WeaponTypeClass.MELEE,
  element: Element.NEUTRAL,
  baseDamage: 55,
  criticalChance: 10,
  attacksPerTurn: 2,
  range: 3,
  rarity: 16,
  price: 100,
  quality: 8,
  abilities: '',
  description: 'desc',
  imageUrl: '',
  rejectionReason: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const requestData: WeaponSubmissionRequest = {
  name: 'Terra Blade',
  weaponClass: WeaponTypeClass.MELEE,
  element: Element.NEUTRAL,
  baseDamage: 55,
  criticalChance: 10,
  attacksPerTurn: 2,
  range: 3,
  rarity: 16,
  price: 100,
  quality: 8,
  abilities: '',
  description: 'desc',
  imageUrl: '',
};

describe('weaponSubmissionService', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.restore();
  });

  it('creates a submission', async () => {
    mock.onPost(BASE_URL).reply(201, sampleSubmission);
    const result = await weaponSubmissionService.create(requestData);
    expect(result.id).toBe('1');
  });

  it('creates an update submission with targetWeaponId', async () => {
    mock.onPost(BASE_URL).reply(201, { ...sampleSubmission, type: 'UPDATE', targetWeaponId: '42' });
    const result = await weaponSubmissionService.create({ ...requestData, targetWeaponId: '42' });
    expect(result.type).toBe('UPDATE');
    expect(result.targetWeaponId).toBe('42');
  });

  it('lists my submissions', async () => {
    mock.onGet(`${BASE_URL}/mine`).reply(200, [sampleSubmission]);
    const result = await weaponSubmissionService.getMine();
    expect(result).toHaveLength(1);
  });

  it('cancels a submission', async () => {
    mock.onDelete(`${BASE_URL}/1`).reply(204);
    await expect(weaponSubmissionService.cancel('1')).resolves.toBeUndefined();
  });

  it('lists submissions filtered by status, defaulting to PENDING', async () => {
    mock.onGet(BASE_URL, { params: { status: 'PENDING' } }).reply(200, [sampleSubmission]);
    const result = await weaponSubmissionService.getAll();
    expect(result).toHaveLength(1);
  });

  it('gets a submission by id', async () => {
    mock.onGet(`${BASE_URL}/1`).reply(200, sampleSubmission);
    const result = await weaponSubmissionService.getById('1');
    expect(result.id).toBe('1');
  });

  it('approves a submission', async () => {
    mock.onPost(`${BASE_URL}/1/approve`).reply(200, { ...sampleSubmission, status: 'APPROVED' });
    const result = await weaponSubmissionService.approve('1');
    expect(result.status).toBe('APPROVED');
  });

  it('rejects a submission with a reason', async () => {
    mock.onPost(`${BASE_URL}/1/reject`).reply(200, {
      ...sampleSubmission,
      status: 'REJECTED',
      rejectionReason: 'Dano incompatível',
    });
    const result = await weaponSubmissionService.reject('1', 'Dano incompatível');
    expect(result.status).toBe('REJECTED');
    expect(result.rejectionReason).toBe('Dano incompatível');
  });
});
