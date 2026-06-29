import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { AuthLayout } from '../common/AuthLayout';
import type { ErrorResponse } from '../../types/api';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      const apiError = err as ErrorResponse;
      if (apiError.status === 401) {
        setError('E-mail ou senha inválidos');
      } else if (apiError.status === 400) {
        setError('Preencha todos os campos corretamente');
      } else {
        setError('Erro de conexão. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm mb-1 text-calamity-text-secondary font-display"
          >
            E-mail
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-calamity-bg-tertiary border border-calamity-border px-3 py-2 text-calamity-text-primary focus:ring-2 focus:ring-calamity-primary focus:outline-none"
            required
            autoComplete="email"
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-sm mb-1 text-calamity-text-secondary font-display"
          >
            Senha
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-calamity-bg-tertiary border border-calamity-border px-3 py-2 text-calamity-text-primary focus:ring-2 focus:ring-calamity-primary focus:outline-none"
            required
            autoComplete="current-password"
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          className="w-full"
        >
          Entrar
        </Button>
        {error && (
          <p className="mt-3 text-sm text-calamity-primary">{error}</p>
        )}
        <p className="mt-4 text-sm text-center text-calamity-text-secondary">
          Não tem conta?{' '}
          <Link to="/register">Registre-se</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
