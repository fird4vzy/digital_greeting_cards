import 'server-only';

import { orderToStoryInput, composeConfigWithTemplate, type StorySource } from './service';
import { resolveTemplateAnywhere } from './registry';
import type { CardConfig } from './schema';
import type { StoryInput } from './template';

/**
 * Composition that can see operator-built templates.
 *
 * The synchronous `composeConfig` in `service.ts` reads the compiled registry
 * and is correct wherever only compiled templates can appear — demo content,
 * seeds. Everything a real order touches comes through here instead, because a
 * card built on a template somebody made in the admin has to compose exactly
 * like any other, and that template lives in the database.
 *
 * Same body either way: both call `composeConfigWithTemplate`. The only
 * difference is how the template was found.
 */
export async function composeConfigAnywhere(
  input: StoryInput,
  templateId: string,
): Promise<CardConfig> {
  return composeConfigWithTemplate(input, await resolveTemplateAnywhere(templateId));
}

export async function composeConfigForOrderAnywhere(
  order: StorySource & { templateId: string },
  templateId?: string,
): Promise<CardConfig> {
  return composeConfigAnywhere(orderToStoryInput(order), templateId ?? order.templateId);
}
