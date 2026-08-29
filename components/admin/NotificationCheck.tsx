'use client';

import { useState, useTransition } from 'react';
import { lookUpChats, testNotifications } from '@/app/admin/actions';
import type { ChatLookup } from '@/lib/notify/telegram';
import type { NotificationState, TestResult } from '@/lib/notify/telegram';
import { t } from '@/lib/i18n';

/**
 * Proves the order notification actually works, without placing an order.
 *
 * Two separate facts, and conflating them is what made this hard to debug: the
 * *configuration* (both variables present, read on the server) and whether
 * Telegram *accepts* it. The first is visible on load; only a send establishes
 * the second, because a token can be revoked and a chat id can be wrong while
 * both variables look perfectly set.
 *
 * Telegram's refusals are shown in its own words. "chat not found" and
 * "Unauthorized" each name a different fix, and a friendlier sentence in place
 * of them would be a worse one.
 */
export function NotificationCheck({
  state,
  strings,
}: {
  state: NotificationState;
  strings: {
    title: string;
    ready: string;
    off: string;
    partial: string;
    test: string;
    testing: string;
    sent: string;
    unconfigured: string;
    rejected: string;
    unreachable: string;
    redeploy: string;
    findChats: string;
    findingChats: string;
    chatsNone: string;
    chatsHint: string;
    chatCurrent: string;
  };
}) {
  const [result, setResult] = useState<TestResult | null>(null);
  const [chats, setChats] = useState<ChatLookup | null>(null);
  const [pending, startTransition] = useTransition();

  const summary =
    state.kind === 'ready'
      ? strings.ready
      : state.kind === 'off'
        ? strings.off
        : t(strings.partial, { missing: state.missing });

  // Off is a deliberate state, not a fault: it is what `npm run dev` and every
  // preview deployment should look like. Half-configured is the dangerous one.
  const tone =
    state.kind === 'partial'
      ? 'border-accent-deep/40 bg-accent/5'
      : 'border-line bg-white/50';

  function message(outcome: TestResult): string {
    if (outcome.ok) return strings.sent;
    switch (outcome.kind) {
      case 'unconfigured':
        return t(strings.unconfigured, { missing: outcome.missing });
      case 'rejected':
        return t(strings.rejected, { detail: `${outcome.detail} (${outcome.status})` });
      case 'unreachable':
        return t(strings.unreachable, { detail: outcome.detail });
    }
  }

  return (
    <section className={`mt-14 rounded-[1rem] border p-6 ${tone}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
        <h2 className="font-display text-title leading-none text-ink">{strings.title}</h2>

        {state.kind !== 'off' ? (
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                setResult(await testNotifications());
              })
            }
            className="rounded-[0.5rem] border border-line-strong px-4 py-2 text-caption text-ink-soft transition-colors hover:border-ink hover:bg-ink hover:text-paper disabled:opacity-50"
          >
            {pending ? strings.testing : strings.test}
          </button>
        ) : null}

        {/* Отдельная кнопка, а не часть проверки: она нужна ровно тогда, когда
            проверка ответила «chat not found», и спрашивает у Telegram другое —
            не «принимаешь ли эти данные», а «какие чаты ты вообще видел». */}
        {state.kind !== 'off' ? (
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                setChats(await lookUpChats());
              })
            }
            className="rounded-[0.5rem] border border-line px-4 py-2 text-caption text-ink-muted transition-colors hover:border-ink hover:text-ink disabled:opacity-50"
          >
            {pending ? strings.findingChats : strings.findChats}
          </button>
        ) : null}
      </div>

      <p className="mt-3 text-caption leading-relaxed text-ink-muted">{summary}</p>

      {state.kind === 'partial' ? (
        <p className="mt-2 text-caption leading-relaxed text-ink-muted">{strings.redeploy}</p>
      ) : null}

      {result ? (
        <p
          role="status"
          className={`mt-4 rounded-[0.6rem] px-4 py-3 text-caption leading-relaxed ${
            result.ok ? 'bg-white text-ink-soft' : 'bg-accent/10 text-accent-deep'
          }`}
        >
          {message(result)}
        </p>
      ) : null}

      {chats ? (
        <div className="mt-4 rounded-[0.6rem] bg-white px-4 py-3 text-caption leading-relaxed text-ink-soft">
          {!chats.ok ? (
            <p>{chats.kind === 'unconfigured' ? strings.unconfigured : chats.detail}</p>
          ) : chats.chats.length === 0 ? (
            <p>{strings.chatsNone}</p>
          ) : (
            <>
              <ul className="space-y-1.5">
                {chats.chats.map((chat) => (
                  <li key={chat.id} className="flex flex-wrap items-baseline gap-x-3">
                    <code className="text-ink tabular-nums">{chat.id}</code>
                    <span className="text-ink-muted">{chat.title}</span>
                    {chat.current ? (
                      <span className="text-[0.7rem] text-accent">{strings.chatCurrent}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-ink-muted">{strings.chatsHint}</p>
            </>
          )}
        </div>
      ) : null}
    </section>
  );
}
