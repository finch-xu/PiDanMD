import { createSignal, onCleanup } from 'solid-js';

export function createDropdown() {
  const [isOpen, setIsOpen] = createSignal(false);
  let ref: HTMLElement | undefined;

  function close() {
    setIsOpen(false);
    stop();
  }

  function handleClickOutside(e: MouseEvent) {
    if (ref && !ref.contains(e.target as Node)) close();
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') close();
  }

  function start() {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
  }

  function stop() {
    document.removeEventListener('mousedown', handleClickOutside);
    document.removeEventListener('keydown', handleKeyDown);
  }

  function toggle() {
    const next = !isOpen();
    setIsOpen(next);
    if (next) start();
    else stop();
  }

  onCleanup(stop);

  return { isOpen, toggle, close, setRef: (el: HTMLElement) => { ref = el; } };
}
