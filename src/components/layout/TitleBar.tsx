import { getCurrentWindow } from '@tauri-apps/api/window';

export function TitleBar() {
  const onDrag = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    getCurrentWindow().startDragging();
  };

  return (
    <div
      data-tauri-drag-region
      class="h-9 flex items-center select-none shrink-0"
      style={{ 'padding-left': '78px' }}
      onMouseDown={onDrag}
    />
  );
}
