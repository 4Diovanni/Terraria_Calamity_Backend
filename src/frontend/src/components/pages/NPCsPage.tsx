import { useNavigate } from 'react-router-dom';

export const NPCsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-calamity-bg-dark text-calamity-text-primary flex items-center justify-center">
      <div className="text-center px-4">
        <div className="text-5xl sm:text-6xl mb-6">🧙</div>
        <h1 className="text-4xl sm:text-5xl font-bold font-display text-calamity-accent-gold mb-4">NPCs</h1>
        <p className="text-xl sm:text-2xl text-calamity-text-secondary mb-8 font-body">
          Esta seção está em desenvolvimento
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-8 py-4 bg-calamity-primary hover:bg-calamity-primary-light text-calamity-text-primary border-2 border-calamity-primary font-display transition-all duration-800"
        >
          Voltar para Home
        </button>
      </div>
    </div>
  );
};
