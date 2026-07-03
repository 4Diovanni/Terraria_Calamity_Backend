import { describe, it, expect } from 'vitest';
import { enemyService } from './enemyService';

describe('enemyService', () => {
  it('returns all enemies', async () => {
    const enemies = await enemyService.getAllEnemies();
    expect(enemies.length).toBeGreaterThan(0);
    enemies.forEach((enemy) => {
      expect(enemy.biome).toBeTruthy();
      expect(enemy.hp).toBeGreaterThan(0);
    });
  });

  it('includes the Anthozoan Crab in the Sulphurous Sea', async () => {
    const enemies = await enemyService.getAllEnemies();
    const crab = enemies.find((e) => e.id === 'anthozoan-crab');
    expect(crab?.name).toBe('Caranguejo Antozoário');
    expect(crab?.biome).toBe('Praia Sulfúrica');
  });

  it('finds an enemy by id', async () => {
    const enemy = await enemyService.getEnemyById('trasher');
    expect(enemy.name).toBe('Trasher');
  });

  it('rejects when the id does not exist', async () => {
    await expect(enemyService.getEnemyById('inexistente')).rejects.toThrow();
  });

  it('returns only the enemies of a given biome', async () => {
    const enemies = await enemyService.getEnemiesByBiome('Praia Sulfúrica');
    expect(enemies.length).toBeGreaterThan(0);
    enemies.forEach((e) => expect(e.biome).toBe('Praia Sulfúrica'));
    expect(enemies.some((e) => e.id === 'anthozoan-crab')).toBe(true);
  });

  it('returns an empty array for a biome with no enemies', async () => {
    const enemies = await enemyService.getEnemiesByBiome('Bioma Inexistente');
    expect(enemies).toEqual([]);
  });
});
