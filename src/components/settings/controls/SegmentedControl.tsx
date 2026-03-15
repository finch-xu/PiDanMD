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
  const activeIndex = () => props.options.findIndex((o) => o.value === props.value);
  const count = () => props.options.length;

  return (
    <div class="flex items-center justify-between">
      {props.label && <span id={`seg-label-${props.label}`} class="text-sm text-subtext1">{props.label}</span>}
      <div
        class="relative flex rounded-lg p-0.5 bg-crust"
        style={{ 'min-width': props.minWidth ?? '160px' }}
        role="radiogroup"
        aria-labelledby={props.label ? `seg-label-${props.label}` : undefined}
      >
        {/* Sliding indicator */}
        <div
          class="absolute top-0.5 bottom-0.5 rounded-md transition-transform duration-200 ease-out bg-surface1 shadow-[0_1px_3px_rgba(0,0,0,0.3)]"
          style={{
            width: `${100 / count()}%`,
            transform: `translateX(${activeIndex() * 100}%)`,
          }}
        />
        {/* Options */}
        {props.options.map((opt) => (
          <button
            class={`relative z-10 flex-1 text-xs py-1.5 text-center rounded-md transition-colors duration-150 focus-visible:ring-1 focus-visible:ring-overlay1 focus-visible:outline-none ${
              props.value === opt.value ? 'text-text font-semibold' : 'text-subtext0 hover:text-subtext1'
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
