import { describe, it, expect } from 'vitest';
import { biomeService } from './biomeService';

describe('biomeService', () => {
  it('returns all biomes', async () => {
    const biomes = await biomeService.getAllBiomes();
    expect(biomes.length).toBeGreaterThan(0);
    biomes.forEach((biome) => {
      expect(biome.name).toBeTruthy();
      expect(Array.isArray(biome.facts)).toBe(true);
    });
  });

  it('uses biome names that match the enemy biome labels', async () => {
    const biomes = await biomeService.getAllBiomes();
    const names = biomes.map((b) => b.name);
    expect(names).toContain('Praia Sulfúrica');
    expect(names).toContain('Mar Afundado');
  });

  it('finds a biome by id', async () => {
    const biome = await biomeService.getBiomeById('sulphurous-sea');
    expect(biome.name).toBe('Praia Sulfúrica');
  });

  it('rejects when the id does not exist', async () => {
    await expect(biomeService.getBiomeById('inexistente')).rejects.toThrow();
  });
});
