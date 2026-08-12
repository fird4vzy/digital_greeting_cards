import { ButtonLink } from '@/components/ui/Button';
import { Wordmark } from '@/components/site/Wordmark';
import { getI18n } from '@/lib/i18n/server';

/**
 * A dead code is a real, recoverable situation: a card that has not been
 * published yet, or a digit misread off a printed tag. It should read as a
 * small apology, not as an error page.
 *
 * There is no card here to take a language from, so this follows the
 * visitor's. `/c/…` is outside the proxy's matcher, so no locale header
 * arrives — `getLocale` falls back to the cookie and then to the default,
 * which is the right answer for someone arriving cold from a QR scan.
 */
export default async function CardNotFound() {
  const { dict } = await getI18n();
  const t = dict.ui.notFound;

  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center gap-10 px-[var(--spacing-gutter)] py-24 text-center">
      <Wordmark />

      <div className="max-w-[34rem]">
        <h1 className="font-display text-display-sm leading-[1.05] tracking-[-0.025em] text-ink">
          {t.title}
        </h1>
        <p className="mt-6 text-body-lg text-pretty text-ink-soft">{t.lead}</p>
        <p className="mt-4 text-caption text-ink-muted">{t.hint}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/">{t.back}</ButtonLink>
        <ButtonLink href="/create" variant="secondary">
          {t.makeOwn}
        </ButtonLink>
      </div>
    </main>
  );
}
