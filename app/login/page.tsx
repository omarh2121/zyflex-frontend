"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isPinValid, setAuthSession } from "@/lib/odense/auth";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Indtast dit navn.");
      return;
    }

    if (pin.length !== 4) {
      setError("PIN-koden skal være 4 cifre.");
      return;
    }

    if (!isPinValid(pin)) {
      setError("Forkert PIN-kode.");
      return;
    }

    setLoading(true);
    setAuthSession(name.trim());
    router.push("/odense");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080c14] px-4">
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center">
        <div className="h-[500px] w-[500px] rounded-full bg-blue-600/5 blur-[150px]" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2">
            <span className="text-3xl">🚕</span>
            <span className="text-xl font-black tracking-wide text-blue-400">ZYFLEX ZONE</span>
          </div>
          <p className="mt-3 text-sm text-slate-500">Chauffør-login · Odense</p>
        </div>

        <div className="rounded-2xl border border-[#1e2d45] bg-[#0f1520] p-8 shadow-2xl">
          <h1 className="mb-2 text-xl font-bold text-white">Log ind</h1>
          <p className="mb-6 text-sm text-slate-500">Indtast navn og PIN-kode for at fortsætte.</p>

          {error && (
            <div className="mb-4 rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-xs font-semibold text-slate-400">
                Navn
              </label>
              <input
                id="name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dit fornavn"
                className="w-full rounded-xl border border-[#1e2d45] bg-[#080c14] px-4 py-3 text-sm text-white placeholder-slate-700 outline-none transition focus:border-blue-600"
              />
            </div>

            <div>
              <label htmlFor="pin" className="mb-1.5 block text-xs font-semibold text-slate-400">
                PIN-kode (4 cifre)
              </label>
              <input
                id="pin"
                type="password"
                required
                inputMode="numeric"
                maxLength={4}
                pattern="\d{4}"
                autoComplete="off"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="••••"
                className="w-full rounded-xl border border-[#1e2d45] bg-[#080c14] px-4 py-3 text-center text-lg tracking-[0.4em] text-white placeholder-slate-700 outline-none transition focus:border-blue-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white transition hover:bg-blue-500 disabled:opacity-60"
            >
              {loading ? "Logger ind…" : "Log ind →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
