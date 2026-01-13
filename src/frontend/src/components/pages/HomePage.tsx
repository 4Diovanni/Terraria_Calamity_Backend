import { useNavigate } from 'react-router-dom';
import { useWeapons } from '../../hooks';

export const HomePage = () => {
  const navigate = useNavigate();
  const { weapons } = useWeapons();

  const sections = [
    {
      title: 'Armas',
      description: 'Domine centenas de armas únicas, cada uma com poderes e habilidades especiais',
      icon: '⚔️',
      path: '/weapons',
      color: 'from-calamity-primary to-calamity-accent-purple',
    },
    {
      title: 'Inimigos',
      description: 'Enfrente os monstros mais terríveis do Calamity',
      icon: '👹',
      path: '/enemies',
      color: 'from-calamity-accent-purple to-calamity-primary',
    },
    {
      title: 'NPCs',
      description: 'Conheça os personagens que guiarão sua jornada',
      icon: '🧙',
      path: '/npcs',
      color: 'from-calamity-accent-gold to-calamity-accent-purple',
    },
    {
      title: 'Biomas',
      description: 'Explore os biomas mais perigosos e místicos',
      icon: '🏜️',
      path: '/biomes',
      color: 'from-calamity-accent-green to-calamity-accent-gold',
    },
    {
      title: 'Itens',
      description: 'Colete itens raros e poderosos para fortalecer seu personagem',
      icon: '💎',
      path: '/items',
      color: 'from-calamity-accent-cyan to-calamity-accent-green',
    },
  ];

  return (
    <div className="min-h-screen bg-calamity-bg-dark text-calamity-text-primary">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 bg-gradient-to-b from-calamity-bg-secondary to-calamity-bg-dark">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-6xl md:text-7xl font-bold font-display text-calamity-accent-gold mb-6 animate-fade-in">
            Terraria Calamity RPG
          </h1>
          <p className="text-2xl text-calamity-text-secondary mb-8 font-body max-w-3xl mx-auto leading-relaxed">
            Bem-vindo ao maior desafio de Terraria. O Calamity Mod traz uma experiência épica com novos chefes,
            itens e mecânicas que testam os limites de qualquer jogador.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => navigate('/weapons')}
              className="px-8 py-4 bg-calamity-primary hover:bg-calamity-primary-light text-calamity-text-primary border-2 border-calamity-primary text-lg font-display transition-all duration-800 hover:shadow-mystical hover:shadow-mystical-lg"
            >
              Explorar Armas
            </button>
            <button
              onClick={() => navigate('/enemies')}
              className="px-8 py-4 bg-transparent hover:bg-calamity-bg-secondary text-calamity-primary border-2 border-calamity-primary text-lg font-display transition-all duration-800 hover:shadow-mystical"
            >
              Ver Inimigos
            </button>
          </div>
        </div>
      </section>

      {/* Lore Section */}
      <section className="py-16 border-b-2 border-calamity-border">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold font-display text-calamity-accent-gold mb-8 text-center">
            A História do Calamity
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-calamity-bg-secondary border border-calamity-border p-8 shadow-mystical hover:shadow-mystical-lg transition-shadow duration-800">
              <h3 className="text-2xl font-bold text-calamity-primary mb-4 font-display">O Começo</h3>
              <p className="text-calamity-text-secondary leading-relaxed font-body">
                O Calamity Mod adiciona um novo nível de dificuldade e progressão ao Terraria. Novos chefes mundiais
                aparecem, trazendo desafios monumentais e recompensas extraordinárias. Cada derrota abre novos caminhos
                e revela segredos antigos.
              </p>
            </div>
            <div className="bg-calamity-bg-secondary border border-calamity-border p-8 shadow-mystical hover:shadow-mystical-lg transition-shadow duration-800">
              <h3 className="text-2xl font-bold text-calamity-accent-purple mb-4 font-display">Seu Destino</h3>
              <p className="text-calamity-text-secondary leading-relaxed font-body">
                Você é o único capaz de enfrentar as ameaças que pairam sobre o mundo. Colete armas poderosas, recrute
                aliados e prepare-se para as batalhas finais. A Calamidade se aproxima, e você será o último dos heróis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold font-display text-calamity-accent-gold mb-12 text-center">
            Explore o Universo
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {sections.map((section) => (
              <button
                key={section.path}
                onClick={() => navigate(section.path)}
                className="group relative overflow-hidden bg-calamity-bg-secondary border-2 border-calamity-border p-8 shadow-mystical hover:shadow-mystical-lg transition-all duration-800 hover:-translate-y-2"
              >
                {/* Background Gradient */}
                <div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-br ${section.color} transition-opacity duration-800`}
                />

                {/* Content */}
                <div className="relative z-10 text-center">
                  <div className="text-5xl mb-4">{section.icon}</div>
                  <h3 className="text-2xl font-bold font-display text-calamity-accent-gold mb-3">
                    {section.title}
                  </h3>
                  <p className="text-sm text-calamity-text-secondary font-body leading-relaxed">
                    {section.description}
                  </p>
                </div>

                {/* Border Animation */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-calamity-primary to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-800" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-calamity-bg-secondary border-t-2 border-calamity-border">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="p-8">
              <div className="text-5xl font-bold text-calamity-primary mb-2">{weapons.length}^</div>
              <p className="text-calamity-text-secondary font-display">Armas</p>
            </div>
            <div className="p-8 border-l border-r border-calamity-border">
              <div className="text-5xl font-bold text-calamity-accent-purple mb-2">200+</div>
              <p className="text-calamity-text-secondary font-display">Inimigos</p>
            </div>
            <div className="p-8">
              <div className="text-5xl font-bold text-calamity-accent-gold mb-2">50+</div>
              <p className="text-calamity-text-secondary font-display">Chefes</p>
            </div>
            <div className="p-8 border-l border-calamity-border">
              <div className="text-5xl font-bold text-calamity-accent-green mb-2">20+</div>
              <p className="text-calamity-text-secondary font-display">Biomas</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
