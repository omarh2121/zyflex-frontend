"use client";

import { useEffect, useState } from "react";
import {
  getDriverInputs,
  saveDriverInput,
  inputTypeLabel,
  inputTypeColor,
  type DriverInputEntry,
  type DriverInputType,
} from "@/lib/storage/driver-input";

const ZONES = [
  "Horsens Centrum",
  "Horsens Station",
  "CASA Arena",
  "Scandic Hotel",
  "Regionshospitalet",
  "Bytorv",
  "Andet",
];

export default function DriverInput() {
  const [inputs, setInputs] = useState<DriverInputEntry[]>([]);
  const [name, setName] = useState("");
  const [zone, setZone] = useState(ZONES[0]);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<DriverInputType>("observation");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setInputs(getDriverInputs());
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    const entry = saveDriverInput({
      name: name.trim(),
      zone,
      message: message.trim(),
      type,
    });

    setInputs((prev) => [entry, ...prev].slice(0, 10));
    setMessage("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2500);
  }

  return (
    <section className="rounded-2xl border border-[#1e2d45] bg-[#0f1520] p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xl">💬</span>
        <h2 className="text-sm font-bold text-slate-300">CHAUFFØRINPUT</h2>
        <span className="ml-auto text-xs text-slate-600">Gemmes lokalt</span>
      </div>

      <form onSubmit={handleSubmit} className="mb-5 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-slate-600">
              Navn
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="F.eks. Ahmed"
              className="w-full rounded-lg border border-[#1e2d45] bg-[#080c14] px-3 py-2 text-sm text-white placeholder-slate-700 outline-none focus:border-blue-600"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-slate-600">
              Zone
            </label>
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="w-full rounded-lg border border-[#1e2d45] bg-[#080c14] px-3 py-2 text-sm text-white outline-none focus:border-blue-600">
              {ZONES.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-slate-600">
            Type
          </label>
          <div className="flex gap-2">
            {(["observation", "demand", "problem"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                  type === t
                    ? "border-blue-700 bg-blue-950/40 text-blue-300"
                    : "border-[#1e2d45] text-slate-500 hover:text-white"
                }`}>
                {inputTypeLabel(t)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-slate-600">
            Besked
          </label>
          <textarea
            required
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="F.eks. Mange mennesker ved stationen, mangler biler..."
            className="w-full resize-none rounded-lg border border-[#1e2d45] bg-[#080c14] px-3 py-2 text-sm text-white placeholder-slate-700 outline-none focus:border-blue-600"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white transition hover:bg-blue-500">
          {submitted ? "✓ Gemt" : "Send input"}
        </button>
      </form>

      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-600">
          Seneste input ({inputs.length})
        </div>
        {inputs.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[#1e2d45] p-4 text-center text-xs text-slate-600">
            Ingen input endnu – chauffører kan rapportere observationer her
          </p>
        ) : (
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {inputs.slice(0, 10).map((entry) => (
              <div
                key={entry.id}
                className="rounded-lg border border-[#1e2d45] bg-[#080c14] p-3 text-xs">
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-semibold text-white">{entry.name}</span>
                  <span className="text-slate-600">· {entry.zone}</span>
                  <span
                    className="ml-auto rounded px-1.5 py-0.5 text-[10px] font-semibold"
                    style={{
                      color: inputTypeColor(entry.type),
                      background: `${inputTypeColor(entry.type)}18`,
                    }}>
                    {inputTypeLabel(entry.type)}
                  </span>
                </div>
                <p className="text-slate-400">{entry.message}</p>
                <div className="mt-1 text-[10px] text-slate-700">
                  {new Date(entry.createdAt).toLocaleString("da-DK", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
