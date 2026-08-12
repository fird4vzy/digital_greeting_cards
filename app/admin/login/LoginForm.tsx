'use client';

import { useActionState } from 'react';
import { signIn, type LoginState } from './actions';

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(signIn, {});

  return (
    <form action={formAction} className="mt-10">
      <label htmlFor="password" className="block text-caption text-ink-muted">
        Пароль
      </label>

      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        autoFocus
        required
        aria-describedby={state.error ? 'login-error' : undefined}
        className="mt-2 h-12 w-full rounded-2xl border border-line-strong bg-white/60 px-4 text-body text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-ink"
      />

      {/* Announced on arrival: the field is focused, so a screen reader user
          would otherwise never hear why the page came back. */}
      {state.error ? (
        <p id="login-error" role="alert" className="mt-3 text-caption text-accent-deep">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 h-12 w-full rounded-full bg-ink text-caption text-paper transition-opacity duration-300 hover:opacity-90 disabled:opacity-50"
      >
        {pending ? 'Проверяем…' : 'Войти'}
      </button>
    </form>
  );
}
