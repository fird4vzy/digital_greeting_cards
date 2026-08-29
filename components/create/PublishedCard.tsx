'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ArrowGlyph, Button, ButtonLink } from '@/components/ui/Button';
import { Blossom } from '@/components/cards/primitives/Motif';
import { easing } from '@/lib/design/motion';
import { useMotionPrefs } from '@/lib/hooks/useMotionPrefs';
import type { Dictionary } from '@/lib/i18n/types';

/**
 * The moment after publishing.
 *
 * Three things the customer needs and nothing else: the link to send, the code
 * the shop prints, and the printable tag itself.
 */
export function PublishedCard({
  code,
  url,
  recipient,
  /**
   * Есть ли что показывать в черновике.
   *
   * Ложь, когда заказчик шаблон не выбирал: черновик собран подобранным
   * шаблоном — тем самым, от которого он отказался. Предлагать «посмотреть»
   * то, что человек только что отклонил, — обещание не того, что он получит.
   */
  hasDraft,
  strings,
}: {
  code: string;
  url: string;
  recipient: string;
  hasDraft: boolean;
  strings: Dictionary['ui']['create']['done'];
}) {
  const { reduced } = useMotionPrefs();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2200);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <motion.section
      className="mx-auto flex w-full max-w-[40rem] flex-1 flex-col items-center justify-center px-[var(--spacing-gutter)] py-32 text-center"
      initial={{ opacity: 0, y: reduced ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0.2 : 0.8, ease: easing.out }}
    >
      <motion.span
        className="text-accent"
        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.5, rotate: -40 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: reduced ? 0.3 : 1, delay: 0.15, ease: easing.weighted }}
      >
        <Blossom className="h-10 w-10" />
      </motion.span>

      <h1 className="mt-8 font-display text-display-sm leading-[1.04] tracking-[-0.03em] text-ink">
        {/* The name sits inside the sentence, not appended to it: Russian
            needs it after "Готово для", Uzbek before its own postposition. */}
        {strings.title.replace('{name}', recipient)}
      </h1>

      {/* Текст тоже обещал черновик, а не только кнопка. Оставить его при
          выключенной кнопке значило бы поменять одну несостыковку на другую. */}
      <p className="mt-5 max-w-[42ch] text-body-lg text-pretty text-ink-soft">
        {hasDraft ? strings.lead : strings.leadNoDraft}
      </p>

      <div className="mt-12 w-full rounded-[1.25rem] border border-line-strong bg-white/70 p-7">
        <span className="eyebrow block text-ink-muted">{strings.codeLabel}</span>
        <p className="mt-3 font-display text-[clamp(2.5rem,2rem+3vw,3.75rem)] leading-none tracking-[0.08em] text-ink tabular-nums">
          {code}
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(url);
                setCopied(true);
              } catch {
                setCopied(false);
              }
            }}
          >
            {copied ? strings.copied : strings.copyLink}
          </Button>
          {/* Черновик, а не `/c/[code]`: тот адрес остаётся только для
              опубликованных, чтобы напечатанная бирка никогда не привела к
              недоделанной открытке.

              А когда шаблон не выбирали, кнопки нет вовсе: показывать нечего,
              и предложение «посмотреть» вело бы к отклонённому шаблону. */}
          {hasDraft ? (
            <ButtonLink href={`/c/${code}/preview`} variant="secondary">
              {strings.openPreview}
              <ArrowGlyph />
            </ButtonLink>
          ) : null}
        </div>

        <p className="mt-6 break-all text-caption text-ink-muted">{url}</p>
      </div>

      <ButtonLink href={`/c/${code}/qr`} variant="ghost" className="mt-8">
        {strings.printQr}
      </ButtonLink>
    </motion.section>
  );
}
