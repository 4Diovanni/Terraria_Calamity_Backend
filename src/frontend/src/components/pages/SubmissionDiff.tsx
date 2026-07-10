import { useState, useEffect } from 'react';
import { weaponService } from '../../services/weaponService';
import { Loading } from '../ui';
import { Weapon } from '../../types/weapon';
import { WeaponSubmission } from '../../types/weaponSubmission';
import { computeWeaponDiff } from '../../lib/weaponDiff';

interface SubmissionDiffProps {
  submission: WeaponSubmission;
}

export const SubmissionDiff = ({ submission }: SubmissionDiffProps) => {
  const [currentWeapon, setCurrentWeapon] = useState<Weapon | null>(null);
  const [loading, setLoading] = useState(submission.type === 'UPDATE');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (submission.type !== 'UPDATE' || !submission.targetWeaponId) return;

    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    weaponService
      .getWeaponById(submission.targetWeaponId)
      .then((weapon) => {
        if (!cancelled) setCurrentWeapon(weapon);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [submission.type, submission.targetWeaponId]);

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
