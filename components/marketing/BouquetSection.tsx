import { Reveal, RevealGroup } from '@/components/ui/Reveal';
import { cardUrl, qrSvg } from '@/lib/qr';
import { siteOrigin } from '@/lib/site-origin';
import type { Dictionary } from '@/lib/i18n/types';
import { SectionHeading } from './SectionHeading';

/**
 * "Attach it to a bouquet" — the physical half of the product.
 *
 * The QR code rendered here is real: it is generated at request time from the
 * demo card's code and it scans. Showing a fake code on the page that explains
 * the code would be the wrong kind of shortcut.
 */
export async function BouquetSection({
  dict,
  demoCode = '8FJ29K',
}: {
  dict: Dictionary;
  demoCode?: string;
}) {
  const origin = await siteOrigin();
  const qr = await qrSvg(cardUrl(origin, demoCode), { dark: '#f6f2ec', width: 240, margin: 0 });

  const art = [
    <BouquetArt key="bouquet" />,
    <QrCardArt key="card" qr={qr} code={demoCode} />,
    <ScanArt key="scan" />,
    <WorldArt key="world" />,
  ];

  const steps = dict.ui.bouquet.steps.map((step, index) => ({
    n: `0${index + 1}`,
    title: step.title,
    body: step.body,
    art: art[index],
  }));

  return (
    <section
      id="bouquet"
      className="grain grain-invert relative overflow-hidden bg-noir px-[var(--spacing-gutter)] py-[var(--spacing-section-lg)]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[70vmin] w-[110vmin] -translate-x-1/2 -translate-y-1/3 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(193,131,106,0.22) 0%, transparent 65%)' }}
      />

      <div className="relative mx-auto w-full max-w-[86rem]">
        <SectionHeading
          eyebrow={dict.ui.bouquet.eyebrow}
          title={dict.ui.bouquet.title}
          lead={dict.ui.bouquet.lead}
          tone="paper"
        />

        <RevealGroup
          step={0.11}
          className="mt-20 grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-4"
        >
          {steps.map((step, index) => (
            <Reveal key={step.n} preset="fade" className="relative">
              {/* Hairline connector between steps on wide screens. */}
              {index < steps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute right-[-1rem] top-[5.5rem] hidden h-px w-8 bg-gradient-to-r from-paper/30 to-transparent lg:block"
                />
              ) : null}

              <div className="flex h-44 items-center justify-center">{step.art}</div>

              <span className="eyebrow mt-8 block text-paper/40 tabular-nums">{step.n}</span>
              <h3 className="mt-3 font-display text-[1.55rem] leading-tight text-paper">
                {step.title}
              </h3>
              <p className="mt-2.5 max-w-[28ch] text-caption leading-relaxed text-paper/55">
                {step.body}
              </p>
            </Reveal>
          ))}
        </RevealGroup>

        <Reveal preset="fade">
          <p className="mx-auto mt-20 max-w-[36ch] text-center font-display text-title italic leading-snug text-paper/70">
            {dict.ui.bouquet.note}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* --- Line art. Drawn, not photographed: it never dates and costs nothing. -- */

function BouquetArt() {
  return (
    <svg viewBox="0 0 120 140" aria-hidden="true" className="h-full w-auto text-paper/70">
      <g fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
        <path d="M60 118V64M60 84c-10-6-16-16-17-27M60 88c10-7 15-16 16-26M60 74c-7-4-11-10-12-17M60 78c7-4 11-11 12-18" />
        <path d="M38 130l6-24h32l6 24z" />
        <path d="M44 106c8 5 24 5 32 0" opacity="0.5" />
      </g>
      <g fill="currentColor" opacity="0.85">
        {[
          [43, 33],
          [60, 24],
          [77, 34],
          [48, 52],
          [72, 53],
        ].map(([cx, cy], index) => (
          <g key={index}>
            {[0, 72, 144, 216, 288].map((angle) => (
              <ellipse
                key={angle}
                cx={cx}
                cy={cy - 5}
                rx="3.1"
                ry="5"
                opacity="0.65"
                transform={`rotate(${angle} ${cx} ${cy})`}
              />
            ))}
          </g>
        ))}
      </g>
    </svg>
  );
}

function QrCardArt({ qr, code }: { qr: string; code: string }) {
  return (
    <div
      className="flex h-[9.5rem] w-[7rem] flex-col items-center justify-between rounded-[0.5rem] border border-paper/25 p-3"
      style={{ rotate: '-4deg' }}
    >
      <span className="text-center font-display text-[0.62rem] leading-tight text-paper/70">
        There&rsquo;s a little something extra for you.
      </span>
      <span className="block h-14 w-14 [&_svg]:h-full [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: qr }} />
      <span className="eyebrow text-[0.5rem] text-paper/40">{code}</span>
    </div>
  );
}

function ScanArt() {
  return (
    <svg viewBox="0 0 100 140" aria-hidden="true" className="h-full w-auto text-paper/70">
      <rect x="24" y="16" width="52" height="108" rx="10" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x="30" y="24" width="40" height="92" rx="5" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.5" />
      <g fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
        <path d="M38 56v-6h6M62 56v-6h-6M38 84v6h6M62 84v6h-6" />
      </g>
      <path d="M36 70h28" stroke="currentColor" strokeWidth="1" opacity="0.85">
        <animate attributeName="opacity" values="0.2;1;0.2" dur="2.4s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

function WorldArt() {
  return (
    <svg viewBox="0 0 100 140" aria-hidden="true" className="h-full w-auto text-paper/70">
      <defs>
        <linearGradient id="world-glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="24" y="16" width="52" height="108" rx="10" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x="30" y="24" width="40" height="92" rx="5" fill="url(#world-glow)" />
      <text
        x="50"
        y="62"
        textAnchor="middle"
        fill="currentColor"
        style={{ font: 'italic 11px var(--font-display, Georgia), serif' }}
      >
        Alina,
      </text>
      <g stroke="currentColor" strokeWidth="0.8" opacity="0.45">
        <path d="M37 76h26M37 82h20M37 88h24" />
      </g>
      <g fill="currentColor" opacity="0.6">
        <circle cx="42" cy="104" r="2" />
        <circle cx="50" cy="101" r="1.4" />
        <circle cx="59" cy="106" r="1.7" />
      </g>
    </svg>
  );
}
