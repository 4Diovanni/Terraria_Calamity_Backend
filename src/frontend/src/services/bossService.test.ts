import { describe, it, expect } from 'vitest';
import { bossService } from './bossService';

describe('bossService', () => {
  it('returns all bosses, each with a theme color and progression', async () => {
    const bosses = await bossService.getAllBosses();
    expect(bosses.length).toBeGreaterThan(0);
    bosses.forEach((boss) => {
      expect(boss.themeColor).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(boss.progression).toBeGreaterThan(0);
    });
  });

  it('finds a boss by id', async () => {
    const boss = await bossService.getBossById('devourer-of-gods');
    expect(boss.name).toBe('Devorador de Deuses');
  });

  it('rejects when the id does not exist', async () => {
    await expect(bossService.getBossById('inexistente')).rejects.toThrow();
  });
});
