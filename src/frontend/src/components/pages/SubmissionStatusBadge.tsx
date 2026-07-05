import { SubmissionStatus } from '../../types/weaponSubmission';

const STATUS_LABEL: Record<SubmissionStatus, string> = {
  PENDING: 'Pendente',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
};

const STATUS_COLOR: Record<SubmissionStatus, string> = {
  PENDING: 'bg-amber-500/20 text-amber-400',
  APPROVED: 'bg-green-500/20 text-green-400',
  REJECTED: 'bg-red-500/20 text-red-400',
};

interface SubmissionStatusBadgeProps {
  status: SubmissionStatus;
}

export const SubmissionStatusBadge = ({ status }: SubmissionStatusBadgeProps) => (
  <span className={`inline-block px-3 py-1 rounded text-xs font-display uppercase ${STATUS_COLOR[status]}`}>
    {STATUS_LABEL[status]}
  </span>
);
