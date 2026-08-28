import { NextResponse } from 'next/server';
import { adminOnly } from '@/lib/auth/guard';
import { z } from 'zod';
import { composeConfig } from '@/lib/card/service';
import { isAiEnabled, planCard, planToStoryInput } from '@/lib/ai/planner';
import { photoSchema } from '@/lib/card/schema';

const bodySchema = z.object({
  brief: z.string().min(1).max(8000),
  /** Language the card should be written in, not the language of the brief. */
  locale: z.string().default('ru'),
  photos: z.array(photoSchema).max(30).default([]),
  hints: z
    .object({
      recipientName: z.string().optional(),
      senderName: z.string().optional(),
      relationship: z.string().optional(),
      occasion: z.string().optional(),
      mood: z.string().optional(),
    })
    .optional(),
});

/**
 * POST /api/ai/plan
 *
 * Natural language in, renderable card configuration out. The response
 * includes both the plan (what the model decided, for operator review) and the
 * composed config (what will actually render), so an operator can audit the
 * decision without reverse-engineering the output.
 *
 * **Только для оператора.** Это и так его инструмент — форма заказчика ходит
 * в `/api/orders`, а сюда не ходит никто, — но до 28 августа маршрут был
 * открыт всему интернету. С включённым `AI_PLANNER=on` каждый запрос уходил в
 * Opus с `max_tokens: 8000`, без лимита, без счётчика и без потолка расходов:
 * ноутбук в цикле выставил бы четырёхзначный счёт за ночь. С выключенным —
 * бесплатно жёг наш процессор на семи регулярках и сборке конфига.
 */
export async function POST(request: Request) {
  const denied = await adminOnly();
  if (denied) return denied;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const result = await planCard({
    brief: parsed.data.brief,
    hints: parsed.data.hints,
    locale: parsed.data.locale,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  const story = planToStoryInput(result.plan, parsed.data.photos, parsed.data.locale);
  const config = composeConfig(story, result.plan.template);

  return NextResponse.json({
    source: result.source,
    aiEnabled: isAiEnabled(),
    plan: result.plan,
    config,
  });
}
