import { t } from '~/lib/i18n';
import Minus from 'lucide-solid/icons/minus';
import Plus from 'lucide-solid/icons/plus';

interface Props {
  value: number;
  min: number;
  max: number;
  step: number;
  label?: string;
  onChange: (value: number) => void;
}

export function NumberStepper(props: Props) {
  const atMin = () => props.value <= props.min;
  const atMax = () => props.value >= props.max;

  function adjust(delta: number) {
    const next = Math.round(Math.min(props.max, Math.max(props.min, props.value + delta)));
    if (next !== props.value) props.onChange(next);
  }

  const btnClass = (disabled: boolean) =>
    `w-7 h-7 flex items-center justify-center rounded-md text-xs transition-colors focus-visible:ring-1 focus-visible:ring-overlay1 focus-visible:outline-none ${
      disabled
        ? 'text-overlay0 cursor-not-allowed'
        : 'text-subtext1 hover:text-text hover:bg-surface1'
    }`;

  return (
    <div
      class="flex items-center gap-0.5 rounded-lg bg-base border border-surface0 p-0.5 h-[34px] shrink-0"
      role="group"
      aria-label={props.label ?? t('fontSizeAdjust')}
    >
      <button
        class={btnClass(atMin())}
        disabled={atMin()}
        onClick={() => adjust(-props.step)}
        aria-label={t('decrease')}
      >
        <Minus size={12} strokeWidth={1.5} />
      </button>
      <span
        class="w-9 text-center text-xs text-text font-medium tabular-nums select-none"
        aria-live="polite"
      >
        {props.value}
      </span>
      <button
        class={btnClass(atMax())}
        disabled={atMax()}
        onClick={() => adjust(props.step)}
        aria-label={t('increase')}
      >
        <Plus size={12} strokeWidth={1.5} />
      </button>
    </div>
  );
}
