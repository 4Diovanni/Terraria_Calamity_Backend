import * as Dialog from '@radix-ui/react-dialog';
import { ReactNode } from 'react';

interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  side?: 'right' | 'bottom';
  children: ReactNode;
}

export const Drawer = ({ open, onOpenChange, title, side = 'right', children }: DrawerProps) => {
  const panelPosition =
    side === 'right'
      ? 'inset-y-0 right-0 h-full w-full max-w-sm overflow-y-auto border-l-2'
      : 'inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-lg border-t-2';

  const panelAnimation = side === 'right' ? 'drawer-panel-right' : 'drawer-panel-bottom';

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 drawer-overlay" />
        <Dialog.Content
          className={`fixed z-50 bg-calamity-bg-secondary border-calamity-border p-6 shadow-mystical-lg focus:outline-none ${panelPosition} ${panelAnimation}`}
        >
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-bold font-display text-calamity-accent-gold">
              {title}
            </Dialog.Title>
            <Dialog.Close
              aria-label="Fechar"
              className="w-11 h-11 flex items-center justify-center text-calamity-text-secondary hover:text-calamity-primary"
            >
              ✕
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
