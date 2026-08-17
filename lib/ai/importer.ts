import 'server-only';

import { strictJsonSchema } from './schema';
import { templateImportSchema, vocabularyForPrompt, type TemplateImport } from './import-schema';

/**
 * THE IMPORTER
 *
 * Point it at a repository of hand-written HTML and it returns a recipe for
 * the builder — the same shape the form posts, so its output lands in a screen
 * an operator already knows how to correct.
 *
 * It is the card planner with a different input. The model reads the page and
 * chooses from the vocabulary in `import-schema.ts`; it cannot emit markup any
 * more than the planner can, because there is no field for markup. What it
 * produces is a **draft**, never a live template: the mapping is a judgement
 * and some of those judgements will be wrong.
 *
 * **What it cannot do is invent vocabulary.** A page with a screen the engine
 * has no beat for gets that screen listed in `unmapped` rather than forced into
 * the nearest fit. That list is the point of running it as much as the recipe
 * is: it names what the engine is missing, in the words of the thing that
 * needed it. The video beat exists because a port turned that up by hand.
 */

export type ImportResult =
  | { ok: true; recipe: TemplateImport }
  | { ok: false; error: string };

const IMPORT_JSON_SCHEMA = strictJsonSchema(templateImportSchema);

/** Total source handed to the model. Enough for a one-page card, not a site. */
const BUDGET = 180_000;

export type SourceFile = { path: string; text: string };

/**
 * Pulls the readable source out of a public GitHub repository.
 *
 * The contents API rather than a clone: no git on the server, no working
 * directory to clean up, and one request per file for a repository that is
 * expected to hold about five. Private repositories are refused rather than
 * asked for a token — a credential that can read source is not something this
 * feature should start collecting.
 */
export async function fetchRepositorySource(url: string): Promise<
  { ok: true; files: SourceFile[] } | { ok: false; error: string }
> {
  const match = url
    .trim()
    .match(/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?(?:\/|$)/);

  if (!match) return { ok: false, error: 'Not a GitHub repository URL' };

  const [, owner, repo] = match;
  const api = `https://api.github.com/repos/${owner}/${repo}/contents/`;

  try {
    const listing = await fetch(api, {
      headers: { accept: 'application/vnd.github+json' },
      signal: AbortSignal.timeout(15_000),
    });

    if (listing.status === 404) {
      return { ok: false, error: 'Repository not found, or it is private' };
    }
    if (!listing.ok) {
      return { ok: false, error: `GitHub answered ${listing.status}` };
    }

    const entries = (await listing.json()) as {
      name: string;
      type: string;
      size: number;
      download_url: string | null;
    }[];

    // Markup and styles only. Images and video are what the page *shows*, and
    // the template does not carry them — an order does.
    const wanted = entries
      .filter((entry) => entry.type === 'file' && /\.(html?|css|js)$/i.test(entry.name))
      .sort((a, b) => (a.name.endsWith('.html') ? -1 : 1) - (b.name.endsWith('.html') ? -1 : 1));

    if (wanted.length === 0) {
      return { ok: false, error: 'No HTML, CSS or JS at the repository root' };
    }

    const files: SourceFile[] = [];
    let spent = 0;

    for (const entry of wanted) {
      if (!entry.download_url || spent >= BUDGET) break;

      const response = await fetch(entry.download_url, { signal: AbortSignal.timeout(15_000) });
      if (!response.ok) continue;

      const text = (await response.text()).slice(0, BUDGET - spent);
      spent += text.length;
      files.push({ path: entry.name, text });
    }

    return files.length > 0
      ? { ok: true, files }
      : { ok: false, error: 'Nothing readable could be downloaded' };
  } catch (error) {
    return { ok: false, error: `Could not read the repository: ${(error as Error).message}` };
  }
}

function systemPrompt(): string {
  return [
    'You read a hand-written HTML greeting card and describe it as a recipe for a template engine.',
    '',
    'The engine renders cards from data. It has a fixed vocabulary of beats, looks, palettes and scenes, and it cannot render anything outside that vocabulary. Your job is to choose the closest honest match for what the page actually does — not to describe the page in prose, and not to invent capabilities.',
    '',
    'Rules that matter more than fidelity:',
    '',
    '1. Never claim a beat the page does not have. A card with no photographs must not list `gallery`.',
    '2. If a screen has no beat that fits, put a short description of it in `unmapped` and leave it out of `supportedSections`. This is expected and useful — it is how the engine learns what it is missing. Do not stretch a beat to cover it.',
    '3. `reorder` moves one beat ahead of another and is applied after the standard arc. Use it only when the page plainly plays a beat out of the standard order. Otherwise null.',
    '4. Pick the palette whose scheme and hue are closest to the page. Getting light-versus-dark right matters far more than getting the exact hue right.',
    '5. `strings` describes the template for an operator choosing between templates — what this card is *for*, in the house voice: short sentences, concrete over abstract, no exclamation marks. Never copy the page\'s own message into them; that belongs to whoever sends a card, not to the template.',
    '',
    'THE VOCABULARY:',
    '',
    vocabularyForPrompt(),
  ].join('\n');
}

function userPrompt(files: SourceFile[], suggestedId: string): string {
  const source = files
    .map((file) => `--- ${file.path} ---\n${file.text}`)
    .join('\n\n');

  return [
    `Suggested id: ${suggestedId}. Use it unless it is unusable.`,
    '',
    'Describe this card as a recipe. Explain each significant choice in one sentence in `rationale`, and be specific in `unmapped` about what a screen did that no beat covers.',
    '',
    source,
  ].join('\n');
}

/** Turns any name into something usable as a template id. */
export function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 32) || 'imported'
  );
}

/**
 * Reads source that is already in hand into a draft recipe.
 *
 * Split from the fetching so a folder dropped into the admin and a repository
 * URL reach the model by the same path — most hand-written cards are a folder
 * on somebody's desktop, and requiring a repository first would be asking the
 * operator to do extra work for the tool's convenience.
 *
 * Requires `ANTHROPIC_API_KEY`. Without it the importer is unavailable and the
 * builder still works by hand, the same relationship the planner has to its
 * heuristic. Note that the key alone no longer switches the planner: writing a
 * customer's letter and reading an operator's folder are separate decisions,
 * and the second one is `AI_PLANNER`.
 */
export async function importFiles(
  files: SourceFile[],
  suggestedName: string,
): Promise<ImportResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { ok: false, error: 'ANTHROPIC_API_KEY is not set' };
  }
  if (files.length === 0) {
    return { ok: false, error: 'No readable files' };
  }

  const suggestedId = slugify(suggestedName);

  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();

    const response = await client.beta.messages.create({
      model: 'claude-opus-5',
      max_tokens: 8000,
      output_config: {
        // Higher than the planner's: reading a stranger's CSS and deciding
        // which of thirty looks it is closest to is a judgement, not a lookup,
        // and this runs once per import rather than once per order.
        effort: 'medium',
        format: { type: 'json_schema', schema: IMPORT_JSON_SCHEMA },
      },
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: systemPrompt(),
      messages: [{ role: 'user', content: userPrompt(files, suggestedId) }],
    });

    if (response.stop_reason === 'refusal') {
      return { ok: false, error: 'The assistant declined to read these files.' };
    }

    const text = response.content.find((block) => block.type === 'text');
    if (!text || text.type !== 'text') {
      return { ok: false, error: 'The assistant returned no content.' };
    }

    const parsed = templateImportSchema.safeParse(JSON.parse(text.text));
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return {
        ok: false,
        error: `${issue?.path.join('.') || 'recipe'}: ${issue?.message ?? 'failed validation'}`,
      };
    }

    return { ok: true, recipe: parsed.data };
  } catch (error) {
    return { ok: false, error: `Import failed: ${(error as Error).message}` };
  }
}

/** The same thing, for source that has to be fetched first. */
export async function importTemplate(url: string): Promise<ImportResult> {
  const source = await fetchRepositorySource(url);
  if (!source.ok) return { ok: false, error: source.error };

  const repo =
    url.match(/github\.com\/[^/]+\/([A-Za-z0-9_.-]+?)(?:\.git)?(?:\/|$)/)?.[1] ?? 'imported';
  return importFiles(source.files, repo);
}
