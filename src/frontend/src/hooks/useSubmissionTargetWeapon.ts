import { useState, useEffect } from 'react';
import { weaponService } from '../services/weaponService';
import { Weapon } from '../types/weapon';
import { WeaponSubmission } from '../types/weaponSubmission';

/**
 * Busca a arma-alvo de uma submissão UPDATE (sob demanda, uma vez por
 * mudança de submission). CREATE ou UPDATE sem targetWeaponId não busca nada.
 */
export function useSubmissionTargetWeapon(submission: WeaponSubmission) {
  const [weapon, setWeapon] = useState<Weapon | null>(null);
  const [loading, setLoading] = useState(submission.type === 'UPDATE' && !!submission.targetWeaponId);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (submission.type !== 'UPDATE' || !submission.targetWeaponId) return;

    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    weaponService
      .getWeaponById(submission.targetWeaponId)
      .then((data) => {
        if (!cancelled) setWeapon(data);
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

  return { weapon, loading, notFound };
}
