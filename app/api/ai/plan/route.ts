import { NextResponse } from 'next/server';
import { z } from 'zod';
import { composeConfig } from '@/lib/card/service';
import { isAiEnabled, planCard, planToStoryInput } from '@/lib/ai/planner';
import { photoSchema } from '@/lib/card/schema';

const bodySchema = z.object({
  brief: z.string().min(1).max(8000),
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
 */
export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const result = await planCard({ brief: parsed.data.brief, hints: parsed.data.hints });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  const story = planToStoryInput(result.plan, parsed.data.photos);
  const config = composeConfig(story, result.plan.template);

  return NextResponse.json({
    source: result.source,
    aiEnabled: isAiEnabled(),
    plan: result.plan,
    config,
  });
}
