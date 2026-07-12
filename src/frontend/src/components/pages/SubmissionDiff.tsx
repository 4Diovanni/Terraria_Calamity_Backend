import { useSubmissionTargetWeapon } from '../../hooks/useSubmissionTargetWeapon';
import { Loading } from '../ui';
import { WeaponSubmission } from '../../types/weaponSubmission';
import { computeWeaponDiff } from '../../lib/weaponDiff';

interface SubmissionDiffProps {
  submission: WeaponSubmission;
}

export const SubmissionDiff = ({ submission }: SubmissionDiffProps) => {
  const { weapon: currentWeapon, loading, notFound } = useSubmissionTargetWeapon(submission);

  if (loading) {
    return <Loading message="Carregando comparação..." fullHeight={false} />;
  }

  const diff = computeWeaponDiff(
    submission.type === 'UPDATE' && !notFound ? currentWeapon : null,
    submission
  );

  return (
    <div className="space-y-1 text-sm">
      {notFound && (
        <p className="text-calamity-text-secondary italic mb-2">
          Arma original não encontrada — exibindo apenas os valores propostos.
        </p>
      )}
      {diff.map((field) => (
        <p key={field.label}>
          <span className="text-calamity-text-secondary">{field.label}: </span>
          {field.changed ? (
            <>
              {field.oldValue !== null && (
                <span className="line-through text-calamity-primary mr-2">{field.oldValue}</span>
              )}
              <span className="text-calamity-accent-green">{field.newValue}</span>
            </>
          ) : (
            <span className="text-calamity-text-secondary">{field.newValue}</span>
          )}
        </p>
      ))}
    </div>
  );
};
