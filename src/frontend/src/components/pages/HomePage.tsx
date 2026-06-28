import { Link, useNavigate } from 'react-router-dom';
import { useWeapons } from '../../hooks';
import { Badge, Carousel } from '../ui';
import type { CarouselItem } from '../ui';
import { PageSidebar } from '../ui/PageSidebar';

const LORE_COLORS = {
  yharim:    '#d4a017',
  calamitas: '#c0392b',
  yharon:    '#e67e22',
  draedon:   '#06b6d4',
  devourer:  '#8e44ad',
  polterghast: '#7f8c8d',
  astral:    '#3b82f6',
  abyss:     '#22c55e',
} as const;

const L = (text: string, color: string) => (
  <span style={{ color }} className="font-semibold">{text}</span>
);

const LoreSection = () => (
  <section id="lore" className="py-12 md:py-20 border-b border-calamity-border">
    <div className="container mx-auto px-4 md:px-8">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-xs font-display uppercase tracking-widest text-calamity-text-tertiary mb-8">
          Prologo
        </p>
        <div className="space-y-6 text-base md:text-xl font-body leading-relaxed text-calamity-text-secondary">
          <p>
            Em uma era em que os deuses governavam com punhos de ferro, um mortal chamado{' '}
            {L('Yharim', LORE_COLORS.yharim)} decidiu que isso era suficiente. Com a força
            de um dragão e a determinação de quem não tem nada a perder, ele desmontou o
            panteão divino peça por peça — mas o preço da vitória foi a sua própria alma.
          </p>
          <p>
            Entre os que serviram sob seu estandarte estava{' '}
            {L('Calamitas', LORE_COLORS.calamitas)} — uma jovem bruxa que herdou um poder
            mágico quase ilimitado ainda na adolescência. Por quase uma década ela combateu
            ao seu lado, revelando-se em cada batalha. Mas quando a brutalidade de{' '}
            {L('Yharim', LORE_COLORS.yharim)} ultrapassou qualquer propósito nobre, ela
            partiu — não como inimiga, mas como a personificação de seu maior arrependimento.
          </p>
          <p>
            Agora, enquanto a{' '}
            {L('Infestacao Astral', LORE_COLORS.astral)} corrói os biomas, o{' '}
            {L('Abismo Sulfurico', LORE_COLORS.abyss)} engole os incautos e as almas
            perdidas do {L('Polterghast', LORE_COLORS.polterghast)} uivam nas profundezas
            da Masmorra, você desperta neste mundo sem entender o que está acontecendo.
          </p>
          <p className="text-calamity-text-primary font-display text-base md:text-lg tracking-wide">
            Mas o mundo de Calamity não espera que você entenda.
            <br />
            Ele apenas exige que você sobreviva.
          </p>
        </div>
      </div>
    </div>
  </section>
);

const RARITY_ACCENT: Record<string, string> = {
  COMMON:    '#94a3b8',
  UNCOMMON:  '#22c55e',
  RARE:      '#3b82f6',
  EPIC:      '#a855f7',
  LEGENDARY: '#d4a017',
};

const ENEMY_ITEMS: CarouselItem[] = [
  {
    id: 'scl',
    title: 'Supreme Calamitas',
    subtitle: 'Chefe Final',
    description:
      'A entidade mais poderosa gerada pela Calamidade. Forjada de chamas negras e destruição primordial, representa o verdadeiro limite de qualquer herói que ousa cruzar seu caminho.',
    accentColor: '#9b1c1c',
    href: '/enemies',
  },
  {
    id: 'yharon',
    title: 'Yharon',
    subtitle: 'Dragao da Selva',
    description:
      'O companheiro eterno de Yharim — um dragão de proporções colossais que guarda a selva profana. Cada fase da batalha revela um poder ainda maior, testando coragem e habilidade ao extremo.',
    accentColor: '#7c3aed',
    href: '/enemies',
  },
  {
    id: 'deus',
    title: 'Deus Cosmico',
    subtitle: 'Ser Celestial',
    description:
      'Uma entidade que existe além do tempo e do espaço, guardiã do cosmos. Seus ataques atravessam dimensões — sobreviver ao encontro exige precisão absoluta.',
    accentColor: '#3b82f6',
    href: '/enemies',
  },
  {
    id: 'providence',
    title: 'Providence',
    subtitle: 'Deusa do Fogo Sagrado',
    description:
      'Guardiã das Bestas Profanas, empunha chamas sagradas e projéteis infernais. Enfrentá-la no altar correto revela a extensão completa de seus poderes e a amplitude de seu domínio.',
    accentColor: '#d4a017',
    href: '/enemies',
  },
  {
    id: 'polterghast',
    title: 'Polterghast',
    subtitle: 'Espirito Antigo',
    description:
      'Um ser composto de almas fragmentadas presas nas profundezas do Abismo. À medida que perde vida, invoca espectros que amplificam o caos do combate.',
    accentColor: '#a78bfa',
    href: '/enemies',
  },
];

const BIOME_ITEMS: CarouselItem[] = [
  {
    id: 'abyss',
    title: 'Abismo Sulfurico',
    subtitle: 'Profundezas do Oceano',
    description:
      'Um oceano de ácido sulfúrico abriga criaturas que jamais viram a luz solar. A pressão aumenta a cada metro descido, e os recursos são escassos mas extremamente valiosos.',
    accentColor: '#22c55e',
    href: '/biomes',
  },
  {
    id: 'astral',
    title: 'Infestacao Astral',
    subtitle: 'Bioma Celestial',
    description:
      'Uma praga de origem astral transformou este território em algo alienígena. Cristais e estruturas incompreensíveis cobrem a paisagem, e os habitantes evoluíram junto com a infestação.',
    accentColor: '#3b82f6',
    href: '/biomes',
  },
  {
    id: 'brimstone',
    title: 'Cratera Brimstone',
    subtitle: 'Bioma Infernal',
    description:
      'Terra queimada e lagos de lava brimstone definem esta região devastada. Apenas os mais resistentes conseguem colher os materiais valiosos que residem entre as chamas.',
    accentColor: '#9b1c1c',
    href: '/biomes',
  },
  {
    id: 'plague',
    title: 'Floresta da Praga',
    subtitle: 'Bioma Corrompido',
    description:
      'Uma floresta outrora próspera agora consumida por uma toxina virulenta criada pela Draedon. Bestas da praga a patrulham, e o próprio ar representa um perigo constante.',
    accentColor: '#4ade80',
    href: '/biomes',
  },
];

const NPC_ITEMS: CarouselItem[] = [
  {
    id: 'alchemist',
    title: 'Alquimista',
    subtitle: 'Vendedor de Pocoes',
    description:
      'Mestre das transmutações e elixires raros. Oferece poções impossíveis de encontrar em outro lugar, desde que você tenha os ingredientes certos para a troca.',
    accentColor: '#d4a017',
    href: '/npcs',
  },
  {
    id: 'banker',
    title: 'Banqueiro',
    subtitle: 'Financeiro',
    description:
      'Gerencia os fundos do aventureiro com uma eficiência suspeita. Sempre disposto a um bom negócio — desde que o lucro final fique com ele.',
    accentColor: '#22c55e',
    href: '/npcs',
  },
  {
    id: 'witch',
    title: 'Bruxa de Sangue',
    subtitle: 'Especialista em Magia',
    description:
      'Detentora de conhecimento proibido sobre magia sanguínea e ritualística. Vende encantamentos e itens de invocação que beiram o lado mais obscuro do poder arcano.',
    accentColor: '#a78bfa',
    href: '/npcs',
  },
  {
    id: 'guide',
    title: 'Guia do Abismo',
    subtitle: 'Explorador',
    description:
      'O único sobrevivente conhecido das camadas mais profundas do Abismo Sulfúrico. Oferece mapas, equipamentos especiais e dicas para quem planeja descer às trevas.',
    accentColor: '#06b6d4',
    href: '/npcs',
  },
];

interface SectionHeadingProps {
  title: string;
  accentColor: string;
  linkTo: string;
  linkLabel?: string;
  intro?: string;
}

const SectionHeading = ({
  title,
  accentColor,
  linkTo,
  linkLabel = 'Ver todos',
  intro,
}: SectionHeadingProps) => (
  <div className="mb-8">
    <div className="flex items-end justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-0.5 h-7 flex-shrink-0" style={{ background: accentColor }} />
        <h2 className="text-3xl md:text-4xl font-bold font-display text-calamity-text-primary">
          {title}
        </h2>
      </div>
      <Link
        to={linkTo}
        className="text-xs font-display uppercase tracking-widest text-calamity-text-tertiary hover:text-calamity-text-primary border-b border-transparent hover:border-calamity-border pb-px transition-colors duration-300 whitespace-nowrap ml-4"
      >
        {linkLabel}
      </Link>
    </div>
    {intro && (
      <p className="text-calamity-text-secondary font-body text-base leading-relaxed max-w-2xl">
        {intro}
      </p>
    )}
  </div>
);

const SIDEBAR_SECTIONS = [
  { id: 'hero',     label: 'Inicio' },
  { id: 'lore',     label: 'Prologo' },
  { id: 'armas',    label: 'Armas' },
  { id: 'inimigos', label: 'Inimigos' },
  { id: 'biomas',   label: 'Biomas' },
  { id: 'npcs',     label: 'NPCs' },
  { id: 'historia', label: 'Historia' },
  { id: 'stats',    label: 'Stats' },
];

export const HomePage = () => {
  const navigate = useNavigate();
  const { weapons, loading } = useWeapons();

  const weaponItems: CarouselItem[] = weapons.slice(0, 5).map((w) => ({
    id: w.id,
    title: w.name,
    subtitle: w.weaponClass,
    description: w.description,
    accentColor: RARITY_ACCENT[w.rarity] ?? '#d4a017',
    meta: (
      <>
        <Badge variant="rarity" value={w.rarity} />
        <Badge variant="class" value={w.weaponClass} />
        <Badge variant="element" value={w.element} />
      </>
    ),
    href: `/weapons/${w.id}`,
    imageUrl: w.imageUrl || undefined,
  }));

  return (
    <div className="min-h-screen bg-calamity-bg-dark text-calamity-text-primary">
      <PageSidebar sections={SIDEBAR_SECTIONS} />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section id="hero" className="relative overflow-hidden py-16 md:py-24 bg-calamity-bg-secondary border-b border-calamity-border">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-bold font-display text-calamity-accent-gold mb-6 animate-fade-in leading-none">
              Terraria<br />Calamity
            </h1>
            <p className="text-lg md:text-xl text-calamity-text-secondary font-body leading-relaxed mb-10 max-w-xl">
              Um repositório completo do universo Calamity Mod. Explore armas, enfrente chefes,
              descubra biomas e conheça os personagens que moldam este mundo.
            </p>
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={() => navigate('/weapons')}
                className="px-8 py-3 bg-calamity-primary hover:bg-calamity-primary-light text-calamity-text-primary border border-calamity-primary font-display text-sm uppercase tracking-wider transition-all duration-300 shadow-mystical hover:shadow-mystical-lg"
              >
                Explorar Armas
              </button>
              <button
                onClick={() => navigate('/enemies')}
                className="px-8 py-3 bg-transparent hover:bg-calamity-bg-tertiary text-calamity-primary border border-calamity-primary font-display text-sm uppercase tracking-wider transition-all duration-300"
              >
                Ver Inimigos
              </button>
            </div>
          </div>
        </div>

        {/* Decorative edge */}
        <div className="absolute right-0 top-0 bottom-0 w-px bg-calamity-border hidden md:block" />
        <div
          className="absolute right-0 top-0 bottom-0 w-64 hidden lg:block opacity-5"
          style={{
            background: 'linear-gradient(to left, var(--color-accent-gold), transparent)',
          }}
        />
      </section>

      <LoreSection />

      {/* ── Armas ────────────────────────────────────────── */}
      <section id="armas" className="py-16 border-b border-calamity-border">
        <div className="container mx-auto px-4 md:px-8">
          <SectionHeading
            title="Armas em Destaque"
            accentColor="var(--color-primary)"
            linkTo="/weapons"
            linkLabel="Ver todas as armas"
            intro="As armas do Calamity abrangem cinco classes de combate — Corpo a Corpo, Distância, Magia, Invocação e Assassino. Cada arma carrega um elemento único: Brimstone, Astral, Sombra, Toxico e outros vinte tipos que determinam afinidades e fraquezas dos inimigos."
          />
          {loading ? (
            <div className="flex items-center gap-3 py-8">
              <div className="w-40 h-60 bg-calamity-bg-secondary border border-calamity-border animate-pulse" />
              <div className="flex-1 space-y-4">
                <div className="h-4 bg-calamity-bg-secondary border border-calamity-border animate-pulse w-1/4" />
                <div className="h-8 bg-calamity-bg-secondary border border-calamity-border animate-pulse w-1/2" />
                <div className="h-4 bg-calamity-bg-secondary border border-calamity-border animate-pulse" />
                <div className="h-4 bg-calamity-bg-secondary border border-calamity-border animate-pulse w-3/4" />
              </div>
            </div>
          ) : weaponItems.length > 0 ? (
            <Carousel
              items={weaponItems}
              layout="portrait-left"
              onSelect={(item) => navigate(`/weapons/${item.id}`)}
            />
          ) : (
            <p className="text-calamity-text-tertiary font-body py-8">
              Nenhuma arma disponivel no momento.
            </p>
          )}
        </div>
      </section>

      {/* ── Inimigos ─────────────────────────────────────── */}
      <section id="inimigos" className="py-16 bg-calamity-bg-secondary border-b border-calamity-border">
        <div className="container mx-auto px-4 md:px-8">
          <SectionHeading
            title="Inimigos"
            accentColor="var(--color-accent-purple)"
            linkTo="/enemies"
            linkLabel="Ver todos os inimigos"
            intro="O Calamity Mod adiciona dezenas de novos inimigos e mais de cinquenta chefes, cada um com padrões de ataque únicos e drops exclusivos. A progressão vai de criaturas comuns do bioma corrompido até entidades que transcendem o tempo e o espaço."
          />
          <Carousel items={ENEMY_ITEMS} layout="portrait-right" />
        </div>
      </section>

      {/* ── Biomas ───────────────────────────────────────── */}
      <section id="biomas" className="py-16 border-b border-calamity-border">
        <div className="container mx-auto px-4 md:px-8">
          <SectionHeading
            title="Biomas"
            accentColor="var(--color-accent-green)"
            linkTo="/biomes"
            linkLabel="Ver todos os biomas"
            intro="Biomas radicalmente distintos alteram a exploração: o Abismo Sulfúrico afoga em ácido, a Infestação Astral contamina com cristais alienígenas, a Cratera Brimstone queima em chamas infernais. Cada bioma exige equipamento específico para sobrevivência."
          />
          <Carousel items={BIOME_ITEMS} layout="portrait-left" />
        </div>
      </section>

      {/* ── NPCs ─────────────────────────────────────────── */}
      <section id="npcs" className="py-16 bg-calamity-bg-secondary border-b border-calamity-border">
        <div className="container mx-auto px-4 md:px-8">
          <SectionHeading
            title="NPCs"
            accentColor="var(--color-accent-gold)"
            linkTo="/npcs"
            linkLabel="Ver todos os NPCs"
            intro="Novos NPCs comerciantes desbloqueiam à medida que você progride. Alquimistas, engenheiros e sobreviventes do Abismo oferecem itens exclusivos e serviços impossíveis de encontrar nos vendedores vanilla."
          />
          <Carousel items={NPC_ITEMS} layout="portrait-right" />
        </div>
      </section>

      {/* ── Lore ─────────────────────────────────────────── */}
      <section id="historia" className="py-16 border-b border-calamity-border">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold font-display text-calamity-accent-gold mb-10 text-center">
              A Historia do Calamity
            </h2>
            <div className="grid md:grid-cols-2 gap-px bg-calamity-border">
              <div className="bg-calamity-bg-dark p-5 md:p-8">
                <h3 className="text-lg font-bold text-calamity-primary mb-4 font-display uppercase tracking-wider">
                  O Começo
                </h3>
                <p className="text-calamity-text-secondary leading-relaxed font-body">
                  O Calamity Mod acrescenta um novo nível de progressão ao Terraria. Novos chefes
                  mundiais emergem trazendo desafios monumentais e recompensas extraordinárias.
                  Cada derrota abre novos caminhos e revela segredos antigos sobre a natureza
                  desta terra corrompida.
                </p>
              </div>
              <div className="bg-calamity-bg-dark p-5 md:p-8">
                <h3 className="text-lg font-bold text-calamity-accent-purple mb-4 font-display uppercase tracking-wider">
                  Seu Destino
                </h3>
                <p className="text-calamity-text-secondary leading-relaxed font-body">
                  Você é o único capaz de enfrentar as ameaças que pairam sobre este mundo.
                  Colete armas poderosas, recrute aliados e prepare-se para as batalhas definitivas.
                  A Calamidade se aproxima — e a jornada começa agora.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────── */}
      <section id="stats" className="py-16 bg-calamity-bg-secondary">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-calamity-border max-w-3xl mx-auto">
            <div className="bg-calamity-bg-secondary p-5 md:p-8 text-center">
              <div className="text-4xl font-bold text-calamity-primary font-display mb-1">
                {weapons.length > 0 ? `${weapons.length}+` : '—'}
              </div>
              <p className="text-xs font-display uppercase tracking-widest text-calamity-text-tertiary">
                Armas
              </p>
            </div>
            <div className="bg-calamity-bg-secondary p-5 md:p-8 text-center">
              <div className="text-4xl font-bold text-calamity-accent-purple font-display mb-1">
                200+
              </div>
              <p className="text-xs font-display uppercase tracking-widest text-calamity-text-tertiary">
                Inimigos
              </p>
            </div>
            <div className="bg-calamity-bg-secondary p-5 md:p-8 text-center">
              <div className="text-4xl font-bold text-calamity-accent-gold font-display mb-1">
                50+
              </div>
              <p className="text-xs font-display uppercase tracking-widest text-calamity-text-tertiary">
                Chefes
              </p>
            </div>
            <div className="bg-calamity-bg-secondary p-5 md:p-8 text-center">
              <div className="text-4xl font-bold text-calamity-accent-green font-display mb-1">
                20+
              </div>
              <p className="text-xs font-display uppercase tracking-widest text-calamity-text-tertiary">
                Biomas
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
