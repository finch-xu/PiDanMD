import type { HeadingInfo } from '~/types/editor';
import { activeHeadingId } from '~/stores/toc';

interface Props {
  heading: HeadingInfo;
}

export function TocItem(props: Props) {
  const isActive = () => activeHeadingId() === props.heading.id;

  const handleClick = () => {
    const el = document.getElementById(props.heading.id);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <button
      class="w-full text-left text-xs py-1.5 transition-colors truncate font-light bg-transparent border-none outline-none focus-visible:ring-1 focus-visible:ring-overlay1 rounded-sm leading-relaxed"
      classList={{
        'text-text': isActive(),
        'text-subtext0': !isActive(),
        'hover:text-text': true,
      }}
      style={{
        'padding-left': `${(props.heading.level - 1) * 14 + 10}px`,
        'padding-right': '10px',
      }}
      onClick={handleClick}
      aria-current={isActive() ? 'location' : undefined}
    >
      {props.heading.text}
    </button>
  );
}
