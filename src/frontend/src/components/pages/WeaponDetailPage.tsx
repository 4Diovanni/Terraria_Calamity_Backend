import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { weaponService } from '../../services/weaponService';
import { submissionService } from '../../services/submissionService';
import { Weapon, WeaponFormData } from '../../types/weapon';
import { useAuth } from '../../hooks/useAuth';
import { WeaponForm } from './WeaponForm';
import { WeaponAside, WeaponMainContent, WeaponFooterContent } from './WeaponDetailContent';
import { Loading } from '../ui/Loading';
import { Error as ErrorView } from '../ui/Error';
import { DetailLayout, Drawer, Button } from '../ui';

export const WeaponDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [weapon, setWeapon] = useState<Weapon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [suggestSuccess, setSuggestSuccess] = useState(false);

  const handleSuggestEdit = async (data: WeaponFormData) => {
    if (!weapon) return;
    await submissionService.create('WEAPON', { ...data, targetWeaponId: weapon.id });
    setIsSuggestOpen(false);
    setSuggestSuccess(true);
  };

  const handleUpdate = async (data: WeaponFormData) => {
    if (!weapon) return;
    const updated = await weaponService.updateWeapon(weapon.id, data);
    setWeapon(updated);
    setIsEditOpen(false);
  };

  const handleDelete = async () => {
    if (!weapon) return;
    setDeleteError(null);
    setIsDeleting(true);
    try {
      await weaponService.deleteWeapon(weapon.id);
      navigate('/weapons');
    } catch (err) {
      const message = (err as { message?: string })?.message;
      setDeleteError(message || 'Erro ao deletar arma.');
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const fetchWeapon = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!id) throw new Error('ID da arma não fornecido');
        const data = await weaponService.getWeaponById(id);
        setWeapon(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar arma';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchWeapon();
  }, [id]);

  if (loading) {
    return <Loading message="Carregando detalhes da arma..." />;
  }

  if (error || !weapon) {
    return <ErrorView message={error || 'Arma não encontrada'} onRetry={() => window.location.reload()} />;
  }

  const actions = (
    <>
      {user?.role === 'ADMIN' && (
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
            Editar
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsConfirmingDelete(true)}>
            Deletar
          </Button>
        </div>
      )}

      {user && user.role !== 'ADMIN' && (
        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSuggestSuccess(false);
              setIsSuggestOpen(true);
            }}
          >
            Sugerir Edição
          </Button>
          {suggestSuccess && (
            <p role="status" className="text-sm text-calamity-accent-green">
              Proposta enviada! Acompanhe o status em "Minhas Propostas".
            </p>
          )}
        </div>
      )}
    </>
  );

  return (
    <>
      <DetailLayout
        backTo="/weapons"
        backLabel="Voltar para Armas"
        aside={<WeaponAside weapon={weapon} actions={actions} />}
        footer={<WeaponFooterContent weapon={weapon} />}
      >
        <WeaponMainContent weapon={weapon} />
      </DetailLayout>

      {user?.role === 'ADMIN' && (
        <Drawer open={isEditOpen} onOpenChange={setIsEditOpen} title="Editar Arma" side="right">
          <WeaponForm
            initialValues={weapon}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditOpen(false)}
            submitLabel="Salvar Alterações"
          />
        </Drawer>
      )}

      {user?.role === 'ADMIN' && (
        <Drawer open={isConfirmingDelete} onOpenChange={setIsConfirmingDelete} title="Deletar Arma" side="right">
          <div className="space-y-4">
            <p className="text-calamity-text-primary">
              Tem certeza que deseja deletar <strong>{weapon.name}</strong>? Esta ação não pode ser
              desfeita.
            </p>
            {deleteError && <p role="alert" className="text-sm text-calamity-primary">{deleteError}</p>}
            <div className="flex gap-3">
              <Button variant="primary" isLoading={isDeleting} onClick={handleDelete}>
                Confirmar Exclusão
              </Button>
              <Button variant="outline" disabled={isDeleting} onClick={() => setIsConfirmingDelete(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </Drawer>
      )}

      {user && user.role !== 'ADMIN' && (
        <Drawer open={isSuggestOpen} onOpenChange={setIsSuggestOpen} title="Sugerir Edição" side="right">
          <WeaponForm
            initialValues={weapon}
            onSubmit={handleSuggestEdit}
            onCancel={() => setIsSuggestOpen(false)}
            submitLabel="Enviar Proposta"
          />
        </Drawer>
      )}
    </>
  );
};
