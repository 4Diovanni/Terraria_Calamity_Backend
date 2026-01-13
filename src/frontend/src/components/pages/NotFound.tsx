import { useNavigate } from 'react-router-dom';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-calamity-bg-dark text-calamity-text-primary flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-7xl font-bold font-display text-calamity-primary mb-4">404</h1>
        <p className="text-3xl font-display mb-4">Página Não Encontrada</p>
        <p className="text-calamity-text-secondary mb-8 text-lg">
          A página que você está procurando foi destruída pelo Calamity...
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-8 py-4 bg-calamity-primary hover:bg-calamity-primary-light text-calamity-text-primary border border-calamity-border text-lg font-display transition-all duration-800 hover:shadow-mystical"
        >
          Voltar para Home
        </button>
      </div>
    </div>
  );
};
