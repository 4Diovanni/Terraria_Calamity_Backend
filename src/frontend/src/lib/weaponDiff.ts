import { Weapon, WeaponFormData } from '../types/weapon';
import { WeaponSubmission } from '../types/weaponSubmission';

export interface DiffField {
  label: string;
  oldValue: string | null;
  newValue: string;
  changed: boolean;
}

type FieldKey = keyof WeaponFormData;

const FIELD_LABELS: Record<FieldKey, string> = {
  name: 'Nome',
  weaponClass: 'Classe',
  element: 'Elemento',
  baseDamage: 'Dano',
  criticalChance: 'Crítico',
  attacksPerTurn: 'Velocidade',
  range: 'Knockback',
  rarity: 'Raridade',
  price: 'Preço',
  quality: 'Qualidade',
  abilities: 'Habilidades',
  description: 'Descrição',
  imageUrl: 'Imagem',
};

const FIELD_ORDER: FieldKey[] = [
  'name',
  'weaponClass',
  'element',
  'baseDamage',
  'criticalChance',
  'attacksPerTurn',
  'range',
  'rarity',
  'price',
  'quality',
  'abilities',
  'description',
  'imageUrl',
];

function formatFieldValue(key: FieldKey, source: WeaponFormData): string {
  const value = source[key];
  if (key === 'criticalChance') return `${value}%`;
  if (key === 'price') return `${value} moedas`;
  return String(value);
}

export function computeWeaponDiff(current: Weapon | null, proposed: WeaponSubmission): DiffField[] {
  return FIELD_ORDER.map((key) => {
    const newValue = formatFieldValue(key, proposed);
    if (!current) {
      return { label: FIELD_LABELS[key], oldValue: null, newValue, changed: true };
    }
    const oldValue = formatFieldValue(key, current);
    return { label: FIELD_LABELS[key], oldValue, newValue, changed: oldValue !== newValue };
  });
}
