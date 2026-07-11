import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import { Loading, Error as ErrorView } from '../ui';
import { AdminDashboard } from '../../types/weaponSubmission';

const DASHBOARD_CARDS: { key: keyof AdminDashboard; label: string }[] = [
  { key: 'totalUsers', label: 'Usuários' },
  { key: 'totalAdmins', label: 'Admins' },
  { key: 'totalWeapons', label: 'Armas' },
  { key: 'pendingSubmissions', label: 'Pendentes' },
  { key: 'approvedSubmissions', label: 'Aprovadas' },
  { key: 'rejectedSubmissions', label: 'Rejeitadas' },
];

export const AdminDashboardView = () => {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getDashboard();
      setDashboard(data);
    } catch (err) {
      const message = (err as { message?: string })?.message;
      setError(message || 'Erro ao carregar o painel administrativo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return <Loading message="Carregando painel administrativo..." fullHeight={false} />;
  }

  if (error) {
    return <ErrorView message={error} onRetry={fetchDashboard} fullHeight={false} />;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {DASHBOARD_CARDS.map(({ key, label }) => (
        <div
          key={key}
          className="bg-calamity-bg-secondary border-2 border-calamity-border p-4 text-center"
        >
          <p className="text-3xl font-bold font-display text-calamity-accent-gold">
            {dashboard ? dashboard[key] : '—'}
          </p>
          <p className="text-xs font-display uppercase text-calamity-text-secondary mt-1">{label}</p>
        </div>
      ))}
    </div>
  );
};
