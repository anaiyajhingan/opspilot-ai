import { signOutAction } from "@/features/auth/actions";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="w-full rounded-sm px-2 py-1.5 text-left text-sm text-[--sev-1] transition-colors duration-150 hover:bg-[--surface-hover] focus-visible:outline-none"
      >
        Sign out
      </button>
    </form>
  );
}
