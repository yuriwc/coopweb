"use client";

import { Select, ListBox } from "@heroui/react";
import { Spinner } from "@heroui/react/spinner";
import { Icon } from "@iconify/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";

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
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  const handlePeriodoChange = useCallback(
    (periodo: string) => {
      setIsLoading(true);

      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());

        if (periodo === "hora") {
          params.delete("periodo");
        } else {
          params.set("periodo", periodo);
        }

        const queryString = params.toString();
        const newUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;

        router.push(newUrl);

        // Reset loading state after a short delay
        setTimeout(() => setIsLoading(false), 500);
      });
    },
    [router, searchParams, baseUrl]
  );

  const selectedPeriodo = periodos.find((p) => p.key === currentPeriodo);

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
        Filtrar por:
      </span>

      <Select
        value={currentPeriodo}
        onChange={(key) => {
          if (key) handlePeriodoChange(key.toString());
        }}
        className="w-48"
        variant="secondary"
        isDisabled={isLoading || isPending}
      >
        <Select.Trigger>
          {(isLoading || isPending) && <Spinner size="sm" color="accent" />}
          <Select.Value>
            {selectedPeriodo && (
              <div className="flex items-center gap-2">
                <Icon
                  icon={selectedPeriodo.icon}
                  className="w-4 h-4 text-gray-500 dark:text-gray-400"
                />
                <span>{selectedPeriodo.label}</span>
              </div>
            )}
          </Select.Value>
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            {periodos.map((periodo) => (
              <ListBox.Item key={periodo.key} id={periodo.key} textValue={periodo.label}>
                <div className="flex items-center gap-2">
                  <Icon icon={periodo.icon} className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span>{periodo.label}</span>
                </div>
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>
    </div>
  );
}
