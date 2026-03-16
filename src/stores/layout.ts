import { createSignal, createMemo } from 'solid-js';
import type { AppConfig } from '~/lib/config-persistence';
import { updateAndSave } from '~/lib/config-persistence';

// ── Types ──────────────────────────────────────

export type LayoutMode = 'files' | 'reading' | 'focus';

const MODES: LayoutMode[] = ['files', 'reading', 'focus'];

const GRID_COLUMNS: Record<LayoutMode, string> = {
  files:   '260px 1fr 0px',
  reading: '260px 1fr 220px',
  focus:   '0px 1fr 0px',
};

// ── Signals ────────────────────────────────────

const [layoutMode, _setLayoutMode] = createSignal<LayoutMode>('files');

export function initLayoutFromConfig(config: AppConfig) {
  const mode = config.layout as LayoutMode;
  if (MODES.includes(mode)) {
    _setLayoutMode(mode);
  }
}

function setLayoutMode(mode: LayoutMode) {
  _setLayoutMode(mode);
  updateAndSave((c) => { c.layout = mode; });
}

function cycleLayoutMode() {
  const current = layoutMode();
  const idx = MODES.indexOf(current);
  const next = MODES[(idx + 1) % MODES.length];
  setLayoutMode(next);
}

// ── Derived state ──────────────────────────────

const gridColumns = createMemo(() => GRID_COLUMNS[layoutMode()]);
const fileListVisible = createMemo(() => layoutMode() !== 'focus');
const tocVisible = createMemo(() => layoutMode() === 'reading');

export {
  layoutMode,
  setLayoutMode,
  cycleLayoutMode,
  gridColumns,
  fileListVisible,
  tocVisible,
};
