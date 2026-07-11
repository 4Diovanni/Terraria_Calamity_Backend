import { useSubmissionTargetWeapon } from '../../hooks/useSubmissionTargetWeapon';
import { WeaponDetailContent } from './WeaponDetailContent';
import { buildPreviewWeapon } from '../../lib/weaponPreview';
import { Loading } from '../ui';
import { WeaponSubmission } from '../../types/weaponSubmission';

interface SubmissionPreviewProps {
  submission: WeaponSubmission;
}

export const SubmissionPreview = ({ submission }: SubmissionPreviewProps) => {
  const { weapon, loading, notFound } = useSubmissionTargetWeapon(submission);

  if (loading) {
    return <Loading message="Carregando preview..." fullHeight={false} />;
  }

  const previewWeapon = buildPreviewWeapon(
    submission,
    submission.type === 'UPDATE' && !notFound ? weapon : null
  );

  return <WeaponDetailContent weapon={previewWeapon} />;
};
