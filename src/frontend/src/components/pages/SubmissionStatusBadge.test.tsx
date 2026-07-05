import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SubmissionStatusBadge } from './SubmissionStatusBadge';

describe('SubmissionStatusBadge', () => {
  it.each([
    ['PENDING', 'Pendente'],
    ['APPROVED', 'Aprovado'],
    ['REJECTED', 'Rejeitado'],
  ] as const)('renders %s as %s', (status, label) => {
    render(<SubmissionStatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
