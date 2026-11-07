"use client";

import { useActionState } from "react";
import { loginAction } from "../actions";
import { SubmitButton, TextField } from "@/components/admin/FormParts";

export function LoginForm({ next, expired }: { next: string; expired: boolean }) {
  const [state, action] = useActionState(loginAction, {});
  return (
    <form action={action} className="card space-y-4 p-6">
      <input type="hidden" name="next" value={next} />
      {expired && !state.message && (
        <p className="rounded-lg bg-gold-50 px-3 py-2 text-sm text-gold-700">Your session has expired. Please sign in again.</p>
      )}
      {state.message && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{state.message}</p>
      )}
      <TextField name="email" label="Email" type="email" autoComplete="username" required />
      <TextField name="password" label="Password" type="password" autoComplete="current-password" required />
      <SubmitButton className="btn-primary w-full py-3">Sign in</SubmitButton>
    </form>
  );
}
