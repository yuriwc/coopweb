"use client";

import { Spinner } from "@heroui/spinner";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoadingOverlay() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [searchParams]);

  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 rounded-2xl z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col items-center gap-3">
          <Spinner
            size="md"
            color="primary"
            classNames={{
              circle1: "border-b-blue-500",
              circle2: "border-b-sky-500",
            }}
          />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Atualizando dados...
          </p>
        </div>
      </div>
    </div>
  );
}
