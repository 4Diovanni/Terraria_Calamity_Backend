import { useState, type FormEvent } from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { WeaponTypeClass, Element, WeaponFormData } from '../../types/weapon';
import { weaponRarityToTier } from '../../lib/weaponRarity';

interface WeaponFormProps {
  initialValues?: WeaponFormData;
  onSubmit: (data: WeaponFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}

const EMPTY_FORM: WeaponFormData = {
  name: '',
  weaponClass: WeaponTypeClass.MELEE,
  element: Element.NEUTRAL,
  baseDamage: 1,
  criticalChance: 1,
  attacksPerTurn: 1,
  range: 0,
  rarity: 0,
  price: 0,
  quality: 0,
  abilities: '',
  description: '',
  imageUrl: '',
};

type FieldErrors = Partial<Record<keyof WeaponFormData, string>>;

function validate(data: WeaponFormData): FieldErrors {
  const errors: FieldErrors = {};
  if (!data.name.trim()) errors.name = 'Informe o nome da arma';
  if (!data.description.trim()) errors.description = 'Informe uma descrição';
  if (data.baseDamage < 1) errors.baseDamage = 'Dano base deve ser pelo menos 1';
  if (data.criticalChance < 1 || data.criticalChance > 20) {
    errors.criticalChance = 'Chance de crítico deve estar entre 1 e 20';
  }
  if (data.attacksPerTurn < 1) errors.attacksPerTurn = 'Ataques por turno deve ser pelo menos 1';
  if (data.range < 0) errors.range = 'Alcance não pode ser negativo';
  if (data.rarity < -1 || data.rarity > 17) errors.rarity = 'Raridade deve estar entre -1 e 17';
  if (data.price < 0) errors.price = 'Preço não pode ser negativo';
  if (data.quality < 0 || data.quality > 10) errors.quality = 'Qualidade deve estar entre 0 e 10';
  return errors;
}

const fieldClass =
  'w-full bg-calamity-bg-tertiary border border-calamity-border px-3 py-2 text-calamity-text-primary focus:ring-2 focus:ring-calamity-primary focus:outline-none';
const labelClass = 'block text-sm mb-1 text-calamity-text-secondary font-display';

export const WeaponForm = ({ initialValues, onSubmit, onCancel, submitLabel }: WeaponFormProps) => {
  const [data, setData] = useState<WeaponFormData>(initialValues ?? EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const setField = <K extends keyof WeaponFormData>(field: K, value: WeaponFormData[K]) =>
    setData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const fieldErrors = validate(data);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (err) {
      const message = (err as { message?: string })?.message;
      setSubmitError(message || 'Erro ao salvar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="wf-name" className={labelClass}>Nome</label>
        <input
          id="wf-name"
          type="text"
          value={data.name}
          onChange={(e) => setField('name', e.target.value)}
          className={fieldClass}
        />
        {errors.name && <p role="alert" className="mt-1 text-sm text-calamity-primary">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="wf-class" className={labelClass}>Classe</label>
          <select
            id="wf-class"
            value={data.weaponClass}
            onChange={(e) => setField('weaponClass', e.target.value as WeaponTypeClass)}
            className={fieldClass}
          >
            {Object.values(WeaponTypeClass).map((cls) => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="wf-element" className={labelClass}>Elemento</label>
          <select
            id="wf-element"
            value={data.element}
            onChange={(e) => setField('element', e.target.value as Element)}
            className={fieldClass}
          >
            {Object.values(Element).map((el) => (
              <option key={el} value={el}>{el}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="wf-baseDamage" className={labelClass}>Dano Base</label>
          <input
            id="wf-baseDamage"
            type="number"
            value={data.baseDamage}
            onChange={(e) => setField('baseDamage', Number(e.target.value))}
            className={fieldClass}
          />
          {errors.baseDamage && <p role="alert" className="mt-1 text-sm text-calamity-primary">{errors.baseDamage}</p>}
        </div>
        <div>
          <label htmlFor="wf-criticalChance" className={labelClass}>Chance de Crítico (1-20)</label>
          <input
            id="wf-criticalChance"
            type="number"
            value={data.criticalChance}
            onChange={(e) => setField('criticalChance', Number(e.target.value))}
            className={fieldClass}
          />
          {errors.criticalChance && <p role="alert" className="mt-1 text-sm text-calamity-primary">{errors.criticalChance}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="wf-attacksPerTurn" className={labelClass}>Ataques por Turno</label>
          <input
            id="wf-attacksPerTurn"
            type="number"
            step="0.1"
            value={data.attacksPerTurn}
            onChange={(e) => setField('attacksPerTurn', Number(e.target.value))}
            className={fieldClass}
          />
          {errors.attacksPerTurn && <p role="alert" className="mt-1 text-sm text-calamity-primary">{errors.attacksPerTurn}</p>}
        </div>
        <div>
          <label htmlFor="wf-range" className={labelClass}>Alcance</label>
          <input
            id="wf-range"
            type="number"
            value={data.range}
            onChange={(e) => setField('range', Number(e.target.value))}
            className={fieldClass}
          />
          {errors.range && <p role="alert" className="mt-1 text-sm text-calamity-primary">{errors.range}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="wf-rarity" className={labelClass}>Raridade (-1 a 17)</label>
        <div className="flex items-center gap-3">
          <input
            id="wf-rarity"
            type="number"
            value={data.rarity}
            onChange={(e) => setField('rarity', Number(e.target.value))}
            className={fieldClass}
          />
          <Badge variant="rarity" value={weaponRarityToTier(data.rarity)} />
        </div>
        {errors.rarity && <p role="alert" className="mt-1 text-sm text-calamity-primary">{errors.rarity}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="wf-price" className={labelClass}>Preço</label>
          <input
            id="wf-price"
            type="number"
            value={data.price}
            onChange={(e) => setField('price', Number(e.target.value))}
            className={fieldClass}
          />
          {errors.price && <p role="alert" className="mt-1 text-sm text-calamity-primary">{errors.price}</p>}
        </div>
        <div>
          <label htmlFor="wf-quality" className={labelClass}>Qualidade (0-10)</label>
          <input
            id="wf-quality"
            type="number"
            value={data.quality}
            onChange={(e) => setField('quality', Number(e.target.value))}
            className={fieldClass}
          />
          {errors.quality && <p role="alert" className="mt-1 text-sm text-calamity-primary">{errors.quality}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="wf-abilities" className={labelClass}>Habilidades</label>
        <textarea
          id="wf-abilities"
          value={data.abilities}
          onChange={(e) => setField('abilities', e.target.value)}
          rows={2}
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="wf-description" className={labelClass}>Descrição</label>
        <textarea
          id="wf-description"
          value={data.description}
          onChange={(e) => setField('description', e.target.value)}
          rows={4}
          className={fieldClass}
        />
        {errors.description && <p role="alert" className="mt-1 text-sm text-calamity-primary">{errors.description}</p>}
      </div>

      <div>
        <label htmlFor="wf-imageUrl" className={labelClass}>URL da Imagem</label>
        <input
          id="wf-imageUrl"
          type="text"
          value={data.imageUrl}
          onChange={(e) => setField('imageUrl', e.target.value)}
          className={fieldClass}
        />
      </div>

      {submitError && <p role="alert" className="text-sm text-calamity-primary">{submitError}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};
