'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from '@/lib/auth/admin';
import { templateRecipeDraftSchema } from '@/lib/card/recipe';
import { getTemplateStore } from '@/lib/db';
import { listTemplates } from '@/templates';
import { importTemplate } from '@/lib/ai/importer';
import type { TemplateImport } from '@/lib/ai/import-schema';

/**
 * Saving a template an operator built.
 *
 * The validation is `templateRecipeDraftSchema`, the same one the store reads
 * back through — every palette, scene, beat and variant is an enum drawn from
 * the vocabulary the renderer actually implements, so a form post cannot ask
 * for a look nobody built. That is the same guarantee the AI layer has, and
 * for the same reason: the model and the operator are both untrusted inputs to
 * a system whose whole claim is that a card is data.
 *
 * Re-verifies the session rather than trusting the layout, exactly as
 * `app/admin/actions.ts` does: a server action is a POST endpoint anybody can
 * call once they know its id.
 */

export type SaveResult = { ok: true; id: string } | { ok: false; error: string };

export async function saveTemplate(payload: unknown): Promise<SaveResult> {
  if (!(await verifyAdminSession((await cookies()).get(ADMIN_SESSION_COOKIE)?.value))) {
    return { ok: false, error: 'Not authenticated' };
  }

  const parsed = templateRecipeDraftSchema.safeParse(payload);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: `${issue?.path.join('.') || 'form'}: ${issue?.message ?? 'invalid'}` };
  }

  // A compiled template is in version control and may already have published
  // cards against it. Shadowing one from the database would make the running
  // product disagree with the repository, so the id is refused outright rather
  // than silently losing to the compiled one at read time.
  if (listTemplates().some((template) => template.id === parsed.data.id)) {
    return { ok: false, error: `id "${parsed.data.id}" belongs to a template in the code` };
  }

  const store = await getTemplateStore();
  const saved = await store.save(parsed.data);

  revalidatePath('/admin/templates');
  revalidatePath('/templates');
  revalidatePath(`/templates/${saved.id}`);
  revalidatePath('/create');
  revalidatePath('/');

  return { ok: true, id: saved.id };
}

export async function deleteTemplate(id: string): Promise<SaveResult> {
  if (!(await verifyAdminSession((await cookies()).get(ADMIN_SESSION_COOKIE)?.value))) {
    return { ok: false, error: 'Not authenticated' };
  }

  const store = await getTemplateStore();
  const removed = await store.remove(id);
  if (!removed) return { ok: false, error: 'not found' };

  // Cards already published on it keep working: a card is stored composed and
  // never reads its template again for content. Only the gallery entry and
  // /templates/<id> go away.
  revalidatePath('/admin/templates');
  revalidatePath('/templates');
  revalidatePath('/create');
  revalidatePath('/');

  return { ok: true, id };
}

/**
 * Reads a repository of hand-written HTML into a draft recipe.
 *
 * Returns it rather than saving it: the mapping is a judgement and some of
 * those judgements will be wrong, so what comes back fills the form for an
 * operator to correct. `unmapped` is handed over untouched — a screen the
 * engine has no beat for is information, not an error.
 */
export async function importFromRepository(
  url: string,
): Promise<
  | { ok: true; recipe: TemplateImport }
  | { ok: false; error: string }
> {
  if (!(await verifyAdminSession((await cookies()).get(ADMIN_SESSION_COOKIE)?.value))) {
    return { ok: false, error: 'Not authenticated' };
  }

  return importTemplate(url);
}
