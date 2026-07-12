import { Weapon, WeaponFormData } from '../types/weapon';

/**
 * Monta um objeto Weapon "de mentira" para preview a partir dos valores de
 * formulário. Campos que só existem depois de persistir (id, createdAt,
 * markdownContent, flavorText) vêm de `base` quando disponível (edição de
 * arma existente); caso contrário usam placeholders neutros (criação nova).
 */
export function buildPreviewWeapon(data: WeaponFormData, base?: Weapon | null): Weapon {
  const now = new Date().toISOString();
  return {
    ...data,
    id: base?.id ?? 'preview',
    createdAt: base?.createdAt ?? now,
    updatedAt: now,
    markdownContent: base?.markdownContent,
    flavorText: base?.flavorText,
  };
}
