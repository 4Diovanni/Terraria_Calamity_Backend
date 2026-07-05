import { useAuth } from '../../hooks/useAuth';
import { UserContributeView } from './UserContributeView';
import { AdminContributeView } from './AdminContributeView';

export const ContributePage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-calamity-bg-dark text-calamity-text-primary pb-16">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl sm:text-6xl font-bold font-display text-calamity-accent-gold mb-8">
          Contribuir
        </h1>
        {user?.role === 'ADMIN' ? <AdminContributeView /> : <UserContributeView />}
      </div>
    </div>
  );
};
