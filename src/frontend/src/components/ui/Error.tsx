interface ErrorProps {
  message: string;
  onRetry?: () => void;
}

export const Error = ({ message, onRetry }: ErrorProps) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-calamity-bg-dark">
      <div className="text-center">
        <div className="text-5xl mb-4 text-calamity-primary">⚠️</div>
        <p className="text-xl text-calamity-text-primary font-display mb-6">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-3 bg-calamity-primary hover:bg-calamity-primary-light text-calamity-text-primary border border-calamity-border transition-all duration-800 hover:shadow-mystical"
          >
            Tentar Novamente
          </button>
        )}
      </div>
    </div>
  );
};
