'use client';

/**
 * Deletion, behind the browser's own confirm dialog.
 *
 * A native `confirm()` rather than a designed modal: this is a rare,
 * destructive, deliberately unglamorous action, and the system dialog is
 * unmistakably a warning in a way a styled sheet in our own palette is not.
 * Cancelling it simply prevents the submit, so with JavaScript off the form
 * still posts — and the server re-checks that the order was never published,
 * which is what actually keeps a printed tag safe.
 */
export function DeleteOrderButton({ label, confirmText }: { label: string; confirmText: string }) {
  return (
    <button
      type="submit"
      onClick={(event) => {
        if (!window.confirm(confirmText)) event.preventDefault();
      }}
      className="block w-full rounded-[0.5rem] border border-line-strong px-4 py-2 text-center text-caption text-ink-soft transition-colors hover:border-accent-deep hover:bg-accent-deep hover:text-paper"
    >
      {label}
    </button>
  );
}
