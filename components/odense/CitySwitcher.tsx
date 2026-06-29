"use client";

import { CITIES, type CityId } from "@/lib/cities/config";

interface CitySwitcherProps {
  value: CityId;
  onChange: (cityId: CityId) => void;
}

export default function CitySwitcher({ value, onChange }: CitySwitcherProps) {
  return (
    <div className="flex rounded-xl border border-[#1e2d45] bg-[#0f1520] p-1">
      {CITIES.map((city) => {
        const active = city.id === value;
        return (
          <button
            key={city.id}
            type="button"
            onClick={() => onChange(city.id)}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold transition ${
              active
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {city.name}
          </button>
        );
      })}
    </div>
  );
}
