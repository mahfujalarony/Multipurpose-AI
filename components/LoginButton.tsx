"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function LoginButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-700 dark:text-zinc-300 max-w-[140px] truncate">
          {session.user?.name ?? "User"}
        </span>
        <button
          onClick={() => signOut()}
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-red-400 hover:text-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="text-sm font-medium text-zinc-700 dark:text-zinc-300 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-indigo-400 transition-colors"
    >
      Log in
    </button>
  );
}
