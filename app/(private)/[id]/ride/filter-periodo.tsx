"use client";

import { Select, SelectItem } from "@heroui/select";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface FilterPeriodoProps {
  currentPeriodo: string;
  baseUrl: string;
}

const periodos = [
  { key: "hora", label: "Por Hora", icon: "solar:clock-circle-linear" },
  { key: "dia", label: "Por Dia", icon: "solar:calendar-date-linear" },
  { key: "semana", label: "Por Semana", icon: "solar:calendar-linear" },
];

export default function FilterPeriodo({
  currentPeriodo,
  baseUrl,
}: FilterPeriodoProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePeriodoChange = useCallback(
    (periodo: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (periodo === "hora") {
        params.delete("periodo");
      } else {
        params.set("periodo", periodo);
      }

      const queryString = params.toString();
      const newUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;

      router.push(newUrl);
    },
    [router, searchParams, baseUrl]
  );

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-sky-100/50 dark:bg-sky-900/30 rounded-full flex items-center justify-center">
          <svg
            className="w-4 h-4 text-sky-600 dark:text-sky-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
        </div>
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Filtrar por:
        </span>
      </div>

      <Select
        selectedKeys={[currentPeriodo]}
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0] as string;
          handlePeriodoChange(selected);
        }}
        className="w-48"
        variant="bordered"
        size="sm"
        classNames={{
          base: "backdrop-blur-sm",
          mainWrapper: "backdrop-blur-sm",
          trigger: [
            "backdrop-blur-md",
            "bg-white/40 dark:bg-white/10",
            "border-white/50 dark:border-white/20",
            "hover:bg-white/50 dark:hover:bg-white/15",
            "focus:bg-white/60 dark:focus:bg-white/20",
            "data-[open=true]:bg-white/60 dark:data-[open=true]:bg-white/20",
            "rounded-xl",
            "shadow-lg",
            "transition-all duration-300",
          ],
          value: "text-slate-800 dark:text-slate-200 font-medium",
          selectorIcon: "text-slate-600 dark:text-slate-400",
          popoverContent: [
            "backdrop-blur-md",
            "bg-white/90 dark:bg-slate-900/90",
            "border-white/50 dark:border-white/20",
            "rounded-xl",
            "shadow-xl",
          ],
          listbox: "p-2",
        }}
        renderValue={(items) => {
          return items.map((item) => {
            const periodo = periodos.find((p) => p.key === item.key);
            return (
              <div key={item.key} className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-slate-600 dark:text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {periodo?.key === "hora" && (
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  )}
                  {periodo?.key === "dia" && (
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="18"
                      rx="2"
                      ry="2"
                      strokeWidth="2"
                    />
                  )}
                  {periodo?.key === "semana" && (
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="18"
                      rx="2"
                      ry="2"
                      strokeWidth="2"
                    />
                  )}
                </svg>
                <span>{periodo?.label}</span>
              </div>
            );
          });
        }}
      >
        {periodos.map((periodo) => (
          <SelectItem
            key={periodo.key}
            className="data-[selected=true]:bg-blue-100/50 dark:data-[selected=true]:bg-blue-900/30"
          >
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-slate-600 dark:text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {periodo.key === "hora" && (
                  <>
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <polyline points="12,6 12,12 16,14" strokeWidth="2" />
                  </>
                )}
                {periodo.key === "dia" && (
                  <>
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="18"
                      rx="2"
                      ry="2"
                      strokeWidth="2"
                    />
                    <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
                    <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
                    <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
                  </>
                )}
                {periodo.key === "semana" && (
                  <>
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="18"
                      rx="2"
                      ry="2"
                      strokeWidth="2"
                    />
                    <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
                    <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
                    <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
                    <path
                      d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"
                      strokeWidth="2"
                    />
                  </>
                )}
              </svg>
              <span>{periodo.label}</span>
            </div>
          </SelectItem>
        ))}
      </Select>
    </div>
  );
}
