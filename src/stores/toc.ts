import { createSignal } from 'solid-js';
import type { HeadingInfo } from '~/types/editor';

const [headings, setHeadings] = createSignal<HeadingInfo[]>([]);
const [activeHeadingId, setActiveHeadingId] = createSignal<string | null>(null);

export { headings, setHeadings, activeHeadingId, setActiveHeadingId };
