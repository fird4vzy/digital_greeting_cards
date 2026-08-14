import Link from 'next/link';
import { listOrders } from '@/lib/db';
import { getPalette } from '@/lib/design/palettes';
import { getI18n } from '@/lib/i18n/server';
import { localiseTemplates, occasionLabel } from '@/lib/i18n/localise';
import { plural } from '@/lib/i18n/plural';
import { listAllTemplateSummaries } from '@/lib/card/registry';
import { TemplateBuilder } from '@/components/admin/TemplateBuilder';
import { getTemplateStore } from '@/lib/db';
import { palettes } from '@/lib/design/palettes';
import { MOODS, OCCASIONS } from '@/lib/card/taxonomy';

// The dashboard reflects a live queue; prerendering it at build time would
// show an operator whatever the data looked like when the image was built.
export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const { dict } = await getI18n();
  return { title: dict.admin.nav.templates };
}

/**
 * The registry, as the shop sees it.
 *
 * The list is derived, not maintained: adding a template file makes it appear
 * with no admin work at all.
 *
 * Below it is the builder, and that is where "templates are code, not content"
 * stopped being the whole truth. A template is a palette, a scene, a list of
 * beats and one word each — data, not behaviour — so it fits a form and a
 * database row, and an operator can add one without a deploy. The compiled
 * ones stay compiled; see `lib/card/recipe.ts`.
 */
export default async function AdminTemplatesPage() {
  const { locale, dict } = await getI18n();
  const t = dict.admin.templates;

  const templates = localiseTemplates(await listAllTemplateSummaries(), dict);
  const orders = await listOrders();
  const stored = await (await getTemplateStore()).list();

  const usage = templates.map((template) => ({
    template,
    count: orders.filter((order) => order.templateId === template.id).length,
  }));

  return (
    <>
      <header className="mb-10">
        <h1 className="font-display text-display-sm leading-none tracking-[-0.025em] text-ink">
          {t.title}
        </h1>
        <p className="mt-3 max-w-[60ch] text-caption text-ink-muted">
          {plural(templates.length, t.lead, locale)}
        </p>
      </header>

      <ul className="divide-y divide-line border-y border-line">
        {usage.map(({ template, count }) => {
          const palette = getPalette(template.paletteId);

          return (
            <li key={template.id} className="grid gap-5 py-7 lg:grid-cols-[16rem_1fr_auto]">
              <div>
                <h2 className="font-display text-title leading-none text-ink">{template.name}</h2>
                <p className="mt-2 text-caption text-ink-muted">{template.tagline}</p>
                <p className="mt-3 flex items-center gap-1.5">
                  {palette.swatches.map((swatch) => (
                    <span
                      key={swatch}
                      title={swatch}
                      className="block h-3 w-3 rounded-full ring-1 ring-inset ring-black/10"
                      style={{ background: swatch }}
                    />
                  ))}
                  <span className="ml-2 text-[0.7rem] text-ink-faint">{palette.name}</span>
                </p>
              </div>

              <dl className="grid grid-cols-1 gap-x-8 gap-y-2 text-caption sm:grid-cols-2">
                <Row label={t.rows.id}>
                  <code className="text-ink">{template.id}</code>
                </Row>
                <Row label={t.rows.scene}>
                  {template.scene === 'none' ? t.noScene : template.scene}
                </Row>
                <Row label={t.rows.suits}>
                  {template.occasions.map((id) => occasionLabel(id, dict)).join(', ')}
                </Row>
                <Row label={t.rows.moods}>{template.moods.join(', ')}</Row>
                <Row label={t.rows.motion}>{template.animationStyle}</Row>
                <Row label={t.rows.sections}>{template.supportedSections.join(', ')}</Row>
              </dl>

              <div className="flex flex-col items-start gap-3 lg:items-end">
                <span className="text-caption text-ink-muted tabular-nums">
                  {plural(count, t.usage, locale)}
                </span>
                <Link
                  href={`/templates/${template.id}`}
                  className="rounded-full border border-line-strong px-4 py-1.5 text-caption text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper"
                >
                  {t.preview}
                </Link>
              </div>
            </li>
          );
        })}
      </ul>

      <section className="mt-16 border-t border-line pt-12">
        <h2 className="font-display text-display-sm leading-none tracking-[-0.025em] text-ink">
          {t.builder.newTemplate}
        </h2>

        <div className="mt-9">
          <TemplateBuilder
            stored={stored}
            strings={t.builder}
            vocabulary={{
              palettes: Object.values(palettes).map((palette) => ({
                id: palette.id,
                name: palette.name,
                swatches: palette.swatches,
              })),
              scenes: ['petals', 'sakura', 'bloom', 'heart', 'embers', 'none'],
              motifs: ['petals', 'sparks', 'linen', 'arch', 'sun', 'branch'],
              occasions: OCCASIONS.map((occasion) => ({
                id: occasion.id,
                label: occasionLabel(occasion.id, dict),
              })),
              moods: MOODS.map((mood) => ({ id: mood.id, label: mood.label })),
            }}
          />
        </div>
      </section>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <dt className="eyebrow w-20 shrink-0 pt-[0.15rem] text-ink-faint">{label}</dt>
      <dd className="text-ink-soft">{children}</dd>
    </div>
  );
}
