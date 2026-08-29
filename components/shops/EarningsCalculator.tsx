'use client';

import { useState } from 'react';
import { OFFER, shopEarnings } from '@/lib/shops/offer';
import type { Locale } from '@/lib/i18n/config';

export type CalculatorStrings = {
  bouquetPrice: string;
  cardsPerMonth: string;
  cardPrice: string;
  perCard: string;
  perMonth: string;
  fee: string;
  feeNote: string;
};

/**
 * The earnings block, driven by the florist's own numbers.
 *
 * A fixed price table was the obvious thing to build and the wrong one. A
 * florist does not want to know what a card costs in the abstract; they want
 * to know what it adds to *their* counter, beside the bouquets *they* sell.
 * Two sliders answer that in a way no table can, and the honest consequence —
 * that the platform's cut is small and visible — is the argument, so it is
 * shown rather than buried.
 */
export function EarningsCalculator({
  strings,
  locale,
}: {
  strings: CalculatorStrings;
  locale: Locale;
}) {
  const [bouquet, setBouquet] = useState<number>(OFFER.calculator.bouquetPrice.default);
  const [cards, setCards] = useState<number>(OFFER.calculator.cardsPerMonth.default);

  const { cardPrice, perCard, perMonth, feePerMonth } = shopEarnings(bouquet, cards);
  const money = (value: number) =>
    `${new Intl.NumberFormat(locale).format(value)} ${OFFER.currency}`;

  return (
    <div className="rounded-[1.5rem] border border-line-strong bg-white/70 p-7 sm:p-9">
      <div className="grid gap-8 sm:grid-cols-2">
        <Slider
          label={strings.bouquetPrice}
          value={bouquet}
          display={money(bouquet)}
          onChange={setBouquet}
          {...OFFER.calculator.bouquetPrice}
        />
        <Slider
          label={strings.cardsPerMonth}
          value={cards}
          display={new Intl.NumberFormat(locale).format(cards)}
          onChange={setCards}
          {...OFFER.calculator.cardsPerMonth}
        />
      </div>

      <dl className="mt-9 grid gap-px overflow-hidden rounded-[1rem] border border-line bg-line sm:grid-cols-3">
        <Figure label={strings.cardPrice} value={money(cardPrice)} />
        <Figure label={strings.perCard} value={money(perCard)} />
        {/* The month is the number that lands: one card is a rounding error, a
            month of them is a bill paid. */}
        <Figure label={strings.perMonth} value={money(perMonth)} emphasis />
      </dl>

      <p className="mt-5 text-caption text-ink-muted">
        {strings.fee.replace('{amount}', money(feePerMonth))}{' '}
        <span className="text-ink-muted">{strings.feeNote}</span>
      </p>
    </div>
  );
}

function Slider({
  label,
  value,
  display,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  display: string;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-3">
        <span className="eyebrow text-ink-muted">{label}</span>
        <span className="font-display text-[1.15rem] leading-none text-ink tabular-nums">
          {display}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-4 h-1 w-full cursor-pointer appearance-none rounded-full bg-line-strong accent-accent"
      />
    </label>
  );
}

function Figure({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="bg-paper p-5">
      <dt className="text-[0.75rem] leading-snug text-ink-muted">{label}</dt>
      <dd
        className={
          emphasis
            ? 'mt-2 font-display text-[1.75rem] leading-none text-accent tabular-nums'
            : 'mt-2 font-display text-[1.35rem] leading-none text-ink tabular-nums'
        }
      >
        {value}
      </dd>
    </div>
  );
}
