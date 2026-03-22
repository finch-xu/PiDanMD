interface Option<T> {
  value: T;
  label: string;
}

interface Props<T> {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  minWidth?: string;
}

export function SegmentedControl<T extends string>(props: Props<T>) {
  return (
    <div class="flex items-center justify-between">
      {props.label && <span id={`seg-label-${props.label}`} class="text-sm text-subtext1">{props.label}</span>}
      <div
        class="flex rounded-lg p-1 gap-1 bg-crust/60 border border-surface0/50"
        style={{ 'min-width': props.minWidth ?? '160px' }}
        role="radiogroup"
        aria-labelledby={props.label ? `seg-label-${props.label}` : undefined}
      >
        {props.options.map((opt) => (
          <button
            class={`flex-1 text-xs py-1.5 text-center rounded-md transition-colors duration-150 focus-visible:ring-1 focus-visible:ring-overlay1 focus-visible:outline-none ${
              props.value === opt.value
                ? 'bg-surface1 shadow-sm text-text font-medium'
                : 'text-subtext0 hover:text-subtext1 hover:bg-surface0/50'
            }`}
            role="radio"
            aria-checked={props.value === opt.value}
            onClick={() => props.onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
