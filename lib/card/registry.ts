import 'server-only';

import { cache } from 'react';

import { getTemplateStore } from '@/lib/db';
import { recipeToDefinition } from './recipe';
import type { TemplateDefinition, TemplateSummary } from './template';
import { toSummary } from './template';
import { DEFAULT_TEMPLATE_ID, getTemplate, listTemplates } from '@/templates';

/**
 * THE FULL REGISTRY: code templates plus the ones an operator built.
 *
 * **Why this is not in `templates/index.ts`.** That module is imported by
 * `CardRenderer`, which runs in the browser. Reaching the database from it
 * would drag the driver into the client bundle, or more likely fail the build.
 * So the compiled registry stays synchronous and client-safe, and everything
 * that needs the stored ones comes through here — server-only, async, and
 * merged at request time.
 *
 * **What still only sees the compiled six-and-one.** `lib/ai/schema.ts` builds
 * its template enum at module load, so a template built in the admin becomes
 * selectable by the AI planner only after the next deploy or restart. That is
 * a real limitation and an acceptable one: the planner picking from a slightly
 * older list produces a worse suggestion, never a broken card, and the
 * alternative is making the enum async and rebuilding the JSON schema per
 * request.
 *
 * A stored template that collides with a compiled id loses. The compiled ones
 * are in version control and a card may already be published against them.
 */

/**
 * Шаблоны, собранные оператором. Один раз за запрос, а не на каждый вызов.
 *
 * Каждый вызов — это `SELECT * FROM card_templates` целиком плюс разбор
 * рецепта каждой строки через Zod. На одном показе открытки
 * `resolveTemplateAnywhere` зовётся дважды, и обе — полный скан таблицы.
 * `cache` из React держит результат ровно в пределах запроса: следующий
 * запрос читает заново, поэтому шаблон, только что созданный в админке,
 * появляется сразу.
 */
const storedDefinitions = cache(async (): Promise<TemplateDefinition[]> => {
  try {
    const store = await getTemplateStore();
    const recipes = await store.list();
    const compiled = new Set(listTemplates().map((template) => template.id));

    return recipes
      .filter((recipe) => !compiled.has(recipe.id))
      .map((recipe) => recipeToDefinition(recipe));
  } catch (error) {
    // The gallery must survive a database that is briefly unreachable: the
    // compiled templates are enough to keep every page rendering.
    console.error(`[registry] could not read stored templates: ${(error as Error).message}`);
    return [];
  }
});

export async function listAllTemplates(): Promise<TemplateDefinition[]> {
  return [...listTemplates(), ...(await storedDefinitions())];
}

export async function listAllTemplateSummaries(): Promise<TemplateSummary[]> {
  return (await listAllTemplates()).map(toSummary);
}

/** Null when nothing by that id exists, compiled or stored. */
export async function findTemplate(id: string): Promise<TemplateDefinition | null> {
  const compiled = getTemplate(id);
  if (compiled) return compiled;

  const stored = await storedDefinitions();
  return stored.find((template) => template.id === id) ?? null;
}

/**
 * Never null: an order whose template has been deleted still has to compose
 * into something rather than throw on a page a customer is looking at.
 */
export async function resolveTemplateAnywhere(id?: string): Promise<TemplateDefinition> {
  const found = id ? await findTemplate(id) : null;
  return found ?? getTemplate(DEFAULT_TEMPLATE_ID)!;
}
