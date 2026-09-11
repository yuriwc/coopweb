import { cn } from "@heroui/react";
import type { CSSProperties, ReactNode, Ref } from "react";

// Vocabulário visual compartilhado pelas telas de tempo real.

export type Tone = "success" | "warning" | "danger" | "accent" | "default";

export const TONE: Record<Tone, { text: string; soft: string; dot: string }> = {
  success: { text: "text-success", soft: "bg-success-soft", dot: "bg-success" },
  warning: { text: "text-warning", soft: "bg-warning-soft", dot: "bg-warning" },
  danger: { text: "text-danger", soft: "bg-danger-soft", dot: "bg-danger" },
  accent: { text: "text-accent", soft: "bg-accent-soft", dot: "bg-accent" },
  default: { text: "text-muted", soft: "bg-default", dot: "bg-muted" },
};

// Curva "com massa", usada em todas as transições destas telas.
export const EASE = "ease-[cubic-bezier(0.32,0.72,0,1)]";

// Atraso da animação de entrada, para escalonar os blocos.
export const rise = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` });

// Moldura dupla: casca translúcida + núcleo com raio concêntrico.
export function Bezel({
  className,
  coreClassName,
  style,
  children,
  ref: shellRef,
}: {
  className?: string;
  coreClassName?: string;
  style?: CSSProperties;
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={shellRef}
      style={style}
      className={cn(
        "rounded-[1.75rem] bg-black/[0.035] p-1.5 ring-1 ring-black/[0.04] dark:bg-white/[0.04] dark:ring-white/[0.07]",
        className
      )}
    >
      <div
        className={cn(
          "h-full rounded-[calc(1.75rem-0.375rem)] bg-surface shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_32px_-20px_rgba(15,23,42,0.18)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
          coreClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function Rotulo({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-[10px] font-semibold uppercase tracking-[0.18em] text-muted",
        className
      )}
    >
      {children}
    </p>
  );
}
