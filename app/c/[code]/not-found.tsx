import { ButtonLink } from '@/components/ui/Button';
import { Wordmark } from '@/components/site/Wordmark';

/**
 * A dead code is a real, recoverable situation: a card that has not been
 * published yet, or a digit misread off a printed tag. It should read as a
 * small apology, not as an error page.
 */
export default function CardNotFound() {
  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center gap-10 px-[var(--spacing-gutter)] py-24 text-center">
      <Wordmark />

      <div className="max-w-[34rem]">
        <h1 className="font-display text-display-sm leading-[1.05] tracking-[-0.025em] text-ink">
          This card isn&rsquo;t here.
        </h1>
        <p className="mt-6 text-body-lg text-pretty text-ink-soft">
          Either the code was read slightly wrong, or the card is still being
          finished by the shop. Both are fixable.
        </p>
        <p className="mt-4 text-caption text-ink-muted">
          Codes are six characters and never contain the letter O or the number 0.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/">Back to the start</ButtonLink>
        <ButtonLink href="/create" variant="secondary">
          Make one of your own
        </ButtonLink>
      </div>
    </main>
  );
}
