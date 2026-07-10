import { useState, useEffect, useCallback } from 'react';
import { WeaponForm } from './WeaponForm';
import { SubmissionStatusBadge } from './SubmissionStatusBadge';
import { SubmissionDiff } from './SubmissionDiff';
import { submissionService } from '../../services/submissionService';
import { Button } from '../ui/Button';
import { Loading, Error as ErrorView, EmptyState } from '../ui';
import { WeaponFormData } from '../../types/weapon';
import { WeaponSubmission } from '../../types/weaponSubmission';

type Tab = 'new' | 'mine';

export const UserContributeView = () => {
  const [tab, setTab] = useState<Tab>('new');
  const [submissions, setSubmissions] = useState<WeaponSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchMine = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await submissionService.getMine('WEAPON');
      setSubmissions(data);
    } catch (err) {
      const message = (err as { message?: string })?.message;
      setError(message || 'Erro ao carregar suas propostas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'mine') fetchMine();
  }, [tab, fetchMine]);

  const handleCreate = async (data: WeaponFormData) => {
    await submissionService.create('WEAPON', data);
    setCreateSuccess(true);
  };

  const handleCancel = async (id: string) => {
    setCancelingId(id);
    try {
      await submissionService.cancel(id);
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
    } finally {
      setCancelingId(null);
    }
  };

  return (
    <div>
      <div className="flex gap-4 border-b-2 border-calamity-border mb-8">
        <button
          type="button"
          onClick={() => setTab('new')}
          className={`pb-3 px-2 font-display uppercase text-sm tracking-wider border-b-2 -mb-0.5 ${
            tab === 'new'
              ? 'text-calamity-accent-gold border-calamity-accent-gold'
              : 'text-calamity-text-secondary border-transparent'
          }`}
        >
          Nova Proposta
        </button>
        <button
          type="button"
          onClick={() => setTab('mine')}
          className={`pb-3 px-2 font-display uppercase text-sm tracking-wider border-b-2 -mb-0.5 ${
            tab === 'mine'
              ? 'text-calamity-accent-gold border-calamity-accent-gold'
              : 'text-calamity-text-secondary border-transparent'
          }`}
        >
          Minhas Propostas
        </button>
      </div>

      {tab === 'new' && (
        <div className="max-w-2xl">
          {createSuccess && (
            <p role="status" className="mb-4 text-sm text-calamity-accent-green">
              Proposta enviada! Acompanhe o status em "Minhas Propostas".
            </p>
          )}
          <WeaponForm
            onSubmit={handleCreate}
            onCancel={() => setCreateSuccess(false)}
            submitLabel="Enviar Proposta"
          />
        </div>
      )}

      {tab === 'mine' && (
        <div>
          {loading && <Loading message="Carregando suas propostas..." fullHeight={false} />}
          {error && <ErrorView message={error} onRetry={fetchMine} fullHeight={false} />}
          {!loading && !error && submissions.length === 0 && (
            <EmptyState
              title="Nenhuma proposta ainda"
              message="Suas propostas de criação ou edição de armas aparecerão aqui."
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
                    className="w-full flex items-start justify-between gap-4 text-left"
                  >
                    <div>
                      <h3 className="text-lg font-bold font-display text-calamity-accent-gold">
                        {submission.name}
                      </h3>
                      <p className="text-sm text-calamity-text-secondary">
                        {submission.type === 'UPDATE' ? 'Edição de arma existente' : 'Nova arma'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <SubmissionStatusBadge status={submission.status} />
                      <span className="text-calamity-text-secondary">
                        {expandedId === submission.id ? '−' : '+'}
                      </span>
                    </div>
                  </button>

                  {expandedId === submission.id && (
                    <div className="mt-4 pt-4 border-t border-calamity-border">
                      <SubmissionDiff submission={submission} />
                    </div>
                  )}

                  {submission.status === 'REJECTED' && submission.rejectionReason && (
                    <p className="mt-3 text-sm text-calamity-primary">
                      Motivo: {submission.rejectionReason}
                    </p>
                  )}
                  {submission.status === 'PENDING' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      isLoading={cancelingId === submission.id}
                      onClick={() => handleCancel(submission.id)}
                    >
                      Cancelar
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
