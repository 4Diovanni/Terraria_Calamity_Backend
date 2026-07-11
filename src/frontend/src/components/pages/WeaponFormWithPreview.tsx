import { useState } from 'react';
import { WeaponForm, EMPTY_FORM } from './WeaponForm';
import { WeaponDetailContent } from './WeaponDetailContent';
import { buildPreviewWeapon } from '../../lib/weaponPreview';
import { Weapon, WeaponFormData } from '../../types/weapon';

interface WeaponFormWithPreviewProps {
  initialValues?: WeaponFormData;
  onSubmit: (data: WeaponFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
  /** Arma-base para preencher id/createdAt/markdownContent/flavorText no preview. undefined = criação nova. */
  previewBase?: Weapon | null;
}

type Tab = 'form' | 'preview';

const tabButtonClass = (active: boolean) =>
  `pb-3 px-2 font-display uppercase text-sm tracking-wider border-b-2 -mb-0.5 ${
    active
      ? 'text-calamity-accent-gold border-calamity-accent-gold'
      : 'text-calamity-text-secondary border-transparent'
  }`;

export const WeaponFormWithPreview = ({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel,
  previewBase,
}: WeaponFormWithPreviewProps) => {
  const [tab, setTab] = useState<Tab>('form');
  const [formData, setFormData] = useState<WeaponFormData>(initialValues ?? EMPTY_FORM);

  return (
    <div>
      <div className="flex gap-4 border-b-2 border-calamity-border mb-6">
        <button type="button" onClick={() => setTab('form')} className={tabButtonClass(tab === 'form')}>
          Formulário
        </button>
        <button
          type="button"
          onClick={() => setTab('preview')}
          className={tabButtonClass(tab === 'preview')}
        >
          Pré-visualização
        </button>
      </div>

      <div style={{ display: tab === 'form' ? 'block' : 'none' }}>
        <WeaponForm
          initialValues={initialValues}
          onSubmit={onSubmit}
          onCancel={onCancel}
          submitLabel={submitLabel}
          onDataChange={setFormData}
        />
      </div>

      {tab === 'preview' && <WeaponDetailContent weapon={buildPreviewWeapon(formData, previewBase)} />}
    </div>
  );
};
