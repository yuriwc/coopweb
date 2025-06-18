import { Card } from "@heroui/card";
import { Icon } from "@iconify/react";
import Link from "next/link";

interface ActionButtonProps {
  title: string;
  description: string;
  href: string;
  icon?: string;
  variant?: "primary" | "secondary" | "tertiary";
}

export function ActionButton({
  title,
  description,
  href,
  icon = "solar:document-linear",
  variant = "primary",
}: ActionButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "secondary":
        return "backdrop-blur-md bg-gradient-to-br from-sky-100/40 via-blue-50/30 to-indigo-100/40 dark:from-sky-950/40 dark:via-blue-950/30 dark:to-indigo-950/40 border-sky-200/40 dark:border-sky-800/30 hover:from-sky-100/60 hover:via-blue-100/50 hover:to-indigo-100/60 dark:hover:from-sky-900/60 dark:hover:via-blue-900/50 dark:hover:to-indigo-900/60";
      case "tertiary":
        return "backdrop-blur-md bg-gradient-to-br from-emerald-100/40 via-teal-50/30 to-cyan-100/40 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-cyan-950/40 border-emerald-200/40 dark:border-emerald-800/30 hover:from-emerald-100/60 hover:via-teal-100/50 hover:to-cyan-100/60 dark:hover:from-emerald-900/60 dark:hover:via-teal-900/50 dark:hover:to-cyan-900/60";
      default:
        return "backdrop-blur-md bg-gradient-to-br from-blue-100/40 via-indigo-50/30 to-purple-100/40 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-purple-950/40 border-blue-200/40 dark:border-blue-800/30 hover:from-blue-100/60 hover:via-indigo-100/50 hover:to-purple-100/60 dark:hover:from-blue-900/60 dark:hover:via-indigo-900/50 dark:hover:to-purple-900/60";
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case "secondary":
        return "text-sky-600 dark:text-sky-400";
      case "tertiary":
        return "text-emerald-600 dark:text-emerald-400";
      default:
        return "text-blue-600 dark:text-blue-400";
    }
  };

  const getIconBg = () => {
    switch (variant) {
      case "secondary":
        return "bg-sky-100/60 dark:bg-sky-900/40 border border-sky-200/50 dark:border-sky-800/30";
      case "tertiary":
        return "bg-emerald-100/60 dark:bg-emerald-900/40 border border-emerald-200/50 dark:border-emerald-800/30";
      default:
        return "bg-blue-100/60 dark:bg-blue-900/40 border border-blue-200/50 dark:border-blue-800/30";
    }
  };

  return (
    <Link href={href} className="block w-full h-full group">
      <Card
        className={`
          w-full h-full transition-all duration-300 
          ${getVariantStyles()}
          border-white/30 dark:border-white/20
          hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98]
          flex flex-col justify-center items-center p-6 gap-4 rounded-2xl
          shadow-lg shadow-blue-500/10 dark:shadow-black/20
        `}
      >
        {/* Crystalline border effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent p-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="h-full w-full rounded-2xl bg-transparent" />
        </div>

        <div
          className={`relative p-4 rounded-xl backdrop-blur-sm ${getIconBg()} ${getIconColor()} shadow-lg transition-all duration-300 group-hover:scale-110`}
        >
          <Icon icon={icon} className="w-8 h-8" />
        </div>

        <div className="relative text-center space-y-2">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
            {title}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {description}
          </p>
        </div>
      </Card>
    </Link>
  );
}
