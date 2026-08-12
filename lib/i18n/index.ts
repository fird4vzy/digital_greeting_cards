import { asLocale, type Locale } from './config';
import { en } from './dictionaries/en';
import { ru } from './dictionaries/ru';
import { uz } from './dictionaries/uz';
import type { Dictionary } from './types';

/**
 * Dictionaries are imported statically rather than through `await import()`.
 *
 * They are plain objects of a few kilobytes and they live on the server, where
 * holding all three costs nothing. Client components never import this module:
 * a server component reads the dictionary and passes the slice it needs down
 * as props, so a browser only ever downloads the strings it actually renders.
 */
const DICTIONARIES: Record<Locale, Dictionary> = { ru, uz, en };

export function getDictionary(locale: string | undefined | null): Dictionary {
  return DICTIONARIES[asLocale(locale)];
}

/**
 * Fills `{placeholders}`.
 *
 * Deliberately not ICU MessageFormat: the product has no plural-sensitive
 * strings that a hand-written count line cannot express, and ICU would add a
 * runtime and a build step to solve a problem this codebase does not have.
 * If real pluralisation arrives (it will, in Russian), this is where it goes.
 */
export function t(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}

export * from './config';
export type { Dictionary, OccasionCopyStrings, TemplateStrings } from './types';
