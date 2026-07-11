import { type ReactNode } from 'react';
import { Weapon, RarityLevel } from '../../types/weapon';
import { weaponRarityToTier } from '../../lib/weaponRarity';
import { Badge, StatBar, EntityHero, MarkdownContent, DetailFooter } from '../ui';

// Borda de acento por raridade — sinal de gameplay (cor semântica), não chrome de tema.
const RARITY_BORDER: Record<RarityLevel, string> = {
  [RarityLevel.COMMON]: 'border-gray-500',
  [RarityLevel.UNCOMMON]: 'border-green-500',
  [RarityLevel.RARE]: 'border-blue-500',
  [RarityLevel.EPIC]: 'border-purple-500',
  [RarityLevel.LEGENDARY]: 'border-yellow-500',
};

interface WeaponAsideProps {
  weapon: Weapon;
  /** Slot para os botões de ação da página real (Editar/Deletar/Sugerir Edição). Ausente no preview. */
  actions?: ReactNode;
}

export const WeaponAside = ({ weapon, actions }: WeaponAsideProps) => (
  <div className="space-y-8">
    <EntityHero
      imageUrl={weapon.imageUrl}
      name={weapon.name}
      accentClass={RARITY_BORDER[weaponRarityToTier(weapon.rarity)] ?? 'border-calamity-border'}
      badges={
        <>
          <Badge variant="element" value={weapon.element} />
          <Badge variant="rarity" value={weaponRarityToTier(weapon.rarity)} />
          <Badge variant="class" value={weapon.weaponClass} />
        </>
      }
    />

    {actions}

    <div className="bg-calamity-bg-secondary border-2 border-calamity-border p-6 space-y-6">
      <h2 className="text-xl font-bold font-display text-calamity-accent-gold border-b-2 border-calamity-border pb-3">
        Estatísticas
      </h2>
      <StatBar label="Dano" value={weapon.baseDamage} max={200} colorClass="text-calamity-primary" />
      <StatBar
        label="Chance de Crítico"
        value={weapon.criticalChance}
        displayValue={`${weapon.criticalChance}%`}
        max={100}
        colorClass="text-calamity-accent-purple"
      />
      <StatBar
        label="Velocidade"
        value={weapon.attacksPerTurn}
        max={5}
        colorClass="text-calamity-accent-green"
      />
      <StatBar label="Knockback" value={weapon.range} max={10} colorClass="text-calamity-primary" />
      <StatBar
        label="Qualidade"
        value={weapon.quality}
        max={10}
        colorClass="text-calamity-accent-blue"
      />
    </div>
  </div>
);

export const WeaponMainContent = ({ weapon }: { weapon: Weapon }) => (
  <>
    <h2 className="text-2xl font-bold font-display text-calamity-accent-gold mb-6 border-b-2 border-calamity-border pb-4">
      Descrição
    </h2>
    <MarkdownContent content={weapon.markdownContent ?? weapon.description} />

    {weapon.abilities && (
      <div className="mt-8">
        <h2 className="text-2xl font-bold font-display text-calamity-accent-gold mb-4 border-b-2 border-calamity-border pb-4">
          Habilidades
        </h2>
        <p className="text-calamity-text-secondary font-body">{weapon.abilities}</p>
      </div>
    )}
  </>
);

export const WeaponFooterContent = ({ weapon }: { weapon: Weapon }) => (
  <DetailFooter
    items={[
      { label: 'Classe', value: weapon.weaponClass },
      { label: 'Preço', value: `${weapon.price} moedas` },
      { label: 'Adicionado em', value: new Date(weapon.createdAt).toLocaleDateString('pt-BR') },
    ]}
    quote={weapon.flavorText}
  />
);

interface WeaponDetailContentProps {
  weapon: Weapon;
  /** Slot de ações opcional, repassado ao WeaponAside (só usado pela página real). */
  actions?: ReactNode;
}

/**
 * Conteúdo visual completo de uma arma (aside + main + footer), sem o chrome
 * de página (link de voltar, min-h-screen) — usado nos previews dentro de Drawer.
 */
export const WeaponDetailContent = ({ weapon, actions }: WeaponDetailContentProps) => (
  <div>
    <div className="flex flex-col gap-8 md:flex-row md:items-start">
      <aside className="md:w-1/3 md:flex-shrink-0 md:sticky md:top-8 md:self-start">
        <WeaponAside weapon={weapon} actions={actions} />
      </aside>
      <main className="md:flex-1 min-w-0">
        <WeaponMainContent weapon={weapon} />
      </main>
    </div>
    <div className="mt-12 pt-8 border-t border-calamity-border">
      <WeaponFooterContent weapon={weapon} />
    </div>
  </div>
);
