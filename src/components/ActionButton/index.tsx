import { Card } from "@heroui/react";
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
        return "bg-sky-50 dark:bg-sky-950 border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900";
      case "tertiary":
        return "bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900";
      default:
        return "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900";
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
        return "bg-sky-100 dark:bg-sky-900 border border-sky-200 dark:border-sky-800";
      case "tertiary":
        return "bg-emerald-100 dark:bg-emerald-900 border border-emerald-200 dark:border-emerald-800";
      default:
        return "bg-blue-100 dark:bg-blue-900 border border-blue-200 dark:border-blue-800";
    }
  };

  return (
    <Link href={href} className="block w-full h-full group">
      <Card
        className={`
          w-full h-full transition-all duration-300 
          ${getVariantStyles()}
          hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98]
          flex flex-col justify-center items-center p-6 gap-4 rounded-2xl
          shadow-md
        `}
      >
        <div
          className={`relative p-4 rounded-xl ${getIconBg()} ${getIconColor()} shadow-md transition-all duration-300 group-hover:scale-110`}
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
