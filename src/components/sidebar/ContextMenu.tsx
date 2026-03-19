import { onCleanup, onMount } from 'solid-js';
import { t } from '~/lib/i18n';
import Pencil from 'lucide-solid/icons/pencil';
import Trash2 from 'lucide-solid/icons/trash-2';

interface ContextMenuProps {
  x: number;
  y: number;
  onRename: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export function ContextMenu(props: ContextMenuProps) {
  let menuRef!: HTMLDivElement;

  const handleClickOutside = (e: MouseEvent) => {
    if (menuRef && !menuRef.contains(e.target as Node)) {
      props.onClose();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') props.onClose();
  };

  onMount(() => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
  });

  onCleanup(() => {
    document.removeEventListener('mousedown', handleClickOutside);
    document.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div
      ref={menuRef}
      class="fixed z-50 py-1 rounded-lg shadow-lg min-w-[140px]"
      style={{
        left: `${props.x}px`,
        top: `${props.y}px`,
        background: 'var(--ctp-surface0)',
        border: '1px solid var(--ctp-surface1)',
      }}
    >
      <button
        class="w-full px-3 py-1.5 text-xs text-left flex items-center gap-2 transition-colors hover:bg-surface1"
        style={{ color: 'var(--ctp-text)' }}
        onClick={() => { props.onRename(); props.onClose(); }}
      >
        <Pencil size={14} />
        {t('rename')}
      </button>
      <button
        class="w-full px-3 py-1.5 text-xs text-left flex items-center gap-2 transition-colors hover:bg-surface1"
        style={{ color: 'var(--ctp-red)' }}
        onClick={() => { props.onDelete(); props.onClose(); }}
      >
        <Trash2 size={14} />
        {t('delete')}
      </button>
    </div>
  );
}
