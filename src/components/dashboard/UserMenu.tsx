"use client";

import { LogOut, UserCircle } from "lucide-react";
import { useState } from "react";

type UserMenuProps = Readonly<{
  name?: string | null;
  email?: string | null;
  logoutAction: () => Promise<void>;
}>;

export function UserMenu({ name, email, logoutAction }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const displayName = name ?? email ?? "Account";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
      >
        <UserCircle className="h-4 w-4 text-brand-primary" aria-hidden="true" />
        <span className="hidden max-w-36 truncate sm:inline">{displayName}</span>
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-20 mt-2 w-64 rounded-2xl border border-slate-100 bg-white p-2 shadow-card-hover">
          <div className="px-3 py-2">
            <p className="truncate text-sm font-semibold text-slate-800">
              {displayName}
            </p>
            {email ? <p className="truncate text-xs text-slate-500">{email}</p> : null}
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="mt-1 inline-flex h-10 w-full items-center gap-2 rounded-xl px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
