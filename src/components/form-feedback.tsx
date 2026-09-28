import type { FormState } from "@/app/actions";

export function FormMessage({ state }: { state: FormState }) {
  return state.message ? <p role="alert" className="border-2 border-black bg-coral p-3 text-sm font-bold">{state.message}</p> : null;
}

export function FieldError({ state, name }: { state: FormState; name: string }) {
  return state.errors[name]?.length ? <span className="text-sm font-bold text-red-700">{state.errors[name][0]}</span> : null;
}
