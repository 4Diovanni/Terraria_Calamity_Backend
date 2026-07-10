import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import { submissionService } from '../../services/submissionService';
import { Button } from '../ui/Button';
import { Loading, Error as ErrorView, EmptyState } from '../ui';
import { AdminDashboard, SubmissionStatus, WeaponSubmission } from '../../types/weaponSubmission';

const STATUS_FILTERS: SubmissionStatus[] = ['PENDING', 'APPROVED', 'REJECTED'];

const STATUS_FILTER_LABEL: Record<SubmissionStatus, string> = {
  PENDING: 'Pendentes',
  APPROVED: 'Aprovadas',
  REJECTED: 'Rejeitadas',
};

const DASHBOARD_CARDS: { key: keyof AdminDashboard; label: string }[] = [
  { key: 'totalUsers', label: 'Usuários' },
  { key: 'totalAdmins', label: 'Admins' },
  { key: 'totalWeapons', label: 'Armas' },
  { key: 'pendingSubmissions', label: 'Pendentes' },
  { key: 'approvedSubmissions', label: 'Aprovadas' },
  { key: 'rejectedSubmissions', label: 'Rejeitadas' },
];

export const AdminContributeView = () => {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus>('PENDING');
  const [submissions, setSubmissions] = useState<WeaponSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [dashboardData, submissionsData] = await Promise.all([
        adminService.getDashboard(),
        submissionService.getAll('WEAPON', statusFilter),
      ]);
      setDashboard(dashboardData);
      setSubmissions(submissionsData);
    } catch (err) {
      const message = (err as { message?: string })?.message;
      setError(message || 'Erro ao carregar o painel administrativo.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleApprove = async (id: string) => {
    setActionError(null);
    try {
      await submissionService.approve(id);
      await fetchAll();
    } catch (err) {
      const message = (err as { message?: string })?.message;
      setActionError(message || 'Erro ao aprovar submissão.');
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) return;
    setActionError(null);
    try {
      await submissionService.reject(id, rejectionReason);
      setRejectingId(null);
      setRejectionReason('');
      await fetchAll();
    } catch (err) {
      const message = (err as { message?: string })?.message;
      setActionError(message || 'Erro ao rejeitar submissão.');
    }
  };

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
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

      <div className="flex gap-3 mb-6">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 font-display uppercase text-sm border-2 ${
              statusFilter === status
                ? 'border-calamity-accent-gold text-calamity-accent-gold'
                : 'border-calamity-border text-calamity-text-secondary'
            }`}
          >
            {STATUS_FILTER_LABEL[status]}
          </button>
        ))}
      </div>

      {actionError && <p role="alert" className="mb-4 text-sm text-calamity-primary">{actionError}</p>}

      {loading && <Loading message="Carregando fila de submissões..." fullHeight={false} />}
      {error && <ErrorView message={error} onRetry={fetchAll} fullHeight={false} />}
      {!loading && !error && submissions.length === 0 && (
        <EmptyState
          title="Nenhuma submissão aqui"
          message="Não há submissões neste status no momento."
          fullHeight={false}
        />
      )}
      {!loading && !error && submissions.length > 0 && (
        <ul className="space-y-4">
          {submissions.map((submission) => (
            <li
              key={submission.id}
              className="bg-calamity-bg-secondary border-2 border-calamity-border p-6"
            >
              <button
                type="button"
                onClick={() => setExpandedId(expandedId === submission.id ? null : submission.id)}
                className="w-full flex items-center justify-between gap-4 text-left"
              >
                <div>
                  <h3 className="text-lg font-bold font-display text-calamity-accent-gold">
                    {submission.name}
                  </h3>
                  <p className="text-sm text-calamity-text-secondary">
                    {submission.type === 'UPDATE' ? 'Edição' : 'Criação'} · por{' '}
                    {submission.submittedByUsername}
                  </p>
                </div>
                <span className="text-calamity-text-secondary">
                  {expandedId === submission.id ? '−' : '+'}
                </span>
              </button>

              {expandedId === submission.id && (
                <div className="mt-4 pt-4 border-t border-calamity-border space-y-2 text-sm text-calamity-text-secondary">
                  <p>Classe: {submission.weaponClass} · Elemento: {submission.element}</p>
                  <p>Dano: {submission.baseDamage} · Crítico: {submission.criticalChance}%</p>
                  <p>
                    Raridade: {submission.rarity} · Preço: {submission.price} · Qualidade: {submission.quality}
                  </p>
                  <p>Descrição: {submission.description}</p>

                  {submission.status === 'PENDING' && (
                    <div className="flex flex-col gap-3 pt-2">
                      <div className="flex gap-3">
                        <Button variant="primary" size="sm" onClick={() => handleApprove(submission.id)}>
                          Aprovar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRejectingId(rejectingId === submission.id ? null : submission.id)}
                        >
                          Rejeitar
                        </Button>
                      </div>
                      {rejectingId === submission.id && (
                        <div className="flex flex-col gap-2">
                          <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Motivo da rejeição"
                            rows={2}
                            className="w-full bg-calamity-bg-tertiary border border-calamity-border px-3 py-2 text-calamity-text-primary focus:ring-2 focus:ring-calamity-primary focus:outline-none"
                          />
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={!rejectionReason.trim()}
                            onClick={() => handleReject(submission.id)}
                          >
                            Confirmar Rejeição
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
