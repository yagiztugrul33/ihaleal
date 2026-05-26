import { Colors } from './theme';

/**
 * Both light and dark Colors are inferred as readonly literal types (`as const`).
 * Helper components want to accept either, so we union them.
 */
export type Palette = typeof Colors.light | typeof Colors.dark;

export function pickPalette(scheme: 'light' | 'dark' | null | undefined): Palette {
  return Colors[scheme === 'dark' ? 'dark' : 'light'];
}
