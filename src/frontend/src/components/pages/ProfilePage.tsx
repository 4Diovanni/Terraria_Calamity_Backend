import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserContributeView } from './UserContributeView';
import { AdminContributeView } from './AdminContributeView';
import { AdminDashboardView } from './AdminDashboardView';

const ROLE_LABEL: Record<string, string> = {
  USER: 'USUÁRIO',
  ADMIN: 'ADMINISTRADOR',
};

type Tab = 'profile' | 'contributions' | 'dashboard';

export const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('profile');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <main className="container mx-auto px-4 py-12">
      <p className="text-xs font-display uppercase tracking-[0.2em] text-calamity-text-secondary mb-3">
        Perfil do aventureiro
      </p>
      <div className="border-b border-calamity-border mb-8" />

      <div className="flex gap-4 border-b-2 border-calamity-border mb-8">
        <button
          type="button"
          onClick={() => setTab('profile')}
          className={`pb-3 px-2 font-display uppercase text-sm tracking-wider border-b-2 -mb-0.5 ${
            tab === 'profile'
              ? 'text-calamity-accent-gold border-calamity-accent-gold'
              : 'text-calamity-text-secondary border-transparent'
          }`}
        >
          Perfil
        </button>
        <button
          type="button"
          onClick={() => setTab('contributions')}
          className={`pb-3 px-2 font-display uppercase text-sm tracking-wider border-b-2 -mb-0.5 ${
            tab === 'contributions'
              ? 'text-calamity-accent-gold border-calamity-accent-gold'
              : 'text-calamity-text-secondary border-transparent'
          }`}
        >
          Contribuições
        </button>
        {user?.role === 'ADMIN' && (
          <button
            type="button"
            onClick={() => setTab('dashboard')}
            className={`pb-3 px-2 font-display uppercase text-sm tracking-wider border-b-2 -mb-0.5 ${
              tab === 'dashboard'
                ? 'text-calamity-accent-gold border-calamity-accent-gold'
                : 'text-calamity-text-secondary border-transparent'
            }`}
          >
            Dashboard
          </button>
        )}
      </div>

      {tab === 'profile' && (
        <div className="max-w-lg">
          <div className="border-l-2 border-calamity-accent-gold pl-6 mb-8">
            <h1 className="text-2xl font-display text-calamity-text-primary mb-6">
              {user?.username}
            </h1>
            <dl className="flex flex-col gap-4">
              <div className="flex gap-6 items-baseline">
                <dt className="text-xs font-display uppercase tracking-widest text-calamity-text-secondary w-20 shrink-0">
                  Entidade
                </dt>
                <dd className="text-sm font-display text-calamity-text-primary">
                  {ROLE_LABEL[user?.role ?? ''] ?? user?.role}
                </dd>
              </div>
              <div className="flex gap-6 items-baseline">
                <dt className="text-xs font-display uppercase tracking-widest text-calamity-text-secondary w-20 shrink-0">
                  Contato
                </dt>
                <dd className="text-sm text-calamity-text-secondary break-all">
                  {user?.email}
                </dd>
              </div>
            </dl>
          </div>

          <div className="border-b border-calamity-border mb-8" />

          <button
            type="button"
            onClick={handleLogout}
            className="text-sm font-display uppercase tracking-wider text-calamity-text-secondary hover:text-calamity-primary border border-calamity-border hover:border-calamity-primary px-4 py-2 transition-colors duration-300"
          >
            Encerrar sessão
          </button>
        </div>
      )}

      {tab === 'contributions' && (
        <div>{user?.role === 'ADMIN' ? <AdminContributeView /> : <UserContributeView />}</div>
      )}

      {tab === 'dashboard' && (
        <div>
          <AdminDashboardView />
        </div>
      )}
    </main>
  );
};
