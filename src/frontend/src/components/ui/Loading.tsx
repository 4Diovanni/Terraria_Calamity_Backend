interface LoadingProps {
  message?: string;
}

export const Loading = ({ message = 'Carregando...' }: LoadingProps) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-calamity-bg-dark">
      <div className="text-center">
        <div className="inline-block animate-slow-spin mb-4">
          <div className="w-16 h-16 border-4 border-calamity-border border-t-calamity-primary rounded-full"></div>
        </div>
        <p className="text-xl text-calamity-text-primary font-display">{message}</p>
      </div>
    </div>
  );
};
