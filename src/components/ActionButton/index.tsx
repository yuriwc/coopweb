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
        return "bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 border-blue-200 dark:border-blue-800 hover:from-blue-100 hover:to-indigo-200 dark:hover:from-blue-900 dark:hover:to-indigo-800";
      case "tertiary":
        return "bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950 dark:to-teal-900 border-emerald-200 dark:border-emerald-800 hover:from-emerald-100 hover:to-teal-200 dark:hover:from-emerald-900 dark:hover:to-teal-800";
      default:
        return "bg-gradient-to-br from-violet-50 to-purple-100 dark:from-violet-950 dark:to-purple-900 border-violet-200 dark:border-violet-800 hover:from-violet-100 hover:to-purple-200 dark:hover:from-violet-900 dark:hover:to-purple-800";
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case "secondary":
        return "text-blue-600 dark:text-blue-400";
      case "tertiary":
        return "text-emerald-600 dark:text-emerald-400";
      default:
        return "text-violet-600 dark:text-violet-400";
    }
  };

  return (
    <Link href={href} className="block w-full h-full group">
      <Card
        className={`
          w-full h-full border transition-all duration-300 
          ${getVariantStyles()}
          hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]
          flex flex-col justify-center items-center p-6 gap-4
        `}
      >
        <div
          className={`p-3 rounded-xl bg-white/50 dark:bg-black/20 ${getIconColor()}`}
        >
          <Icon icon={icon} className="w-8 h-8" />
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-foreground group-hover:text-foreground-800 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-foreground-600 leading-relaxed">
            {description}
          </p>
        </div>
      </Card>
    </Link>
  );
}
