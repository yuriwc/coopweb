import Link from "next/link";

interface ActionButtonProps {
  title: string;
  description: string;
  href: string;
  variant?: "primary" | "secondary";
}

export function ActionButton({
  title,
  description,
  href,
  variant = "primary",
}: ActionButtonProps) {
  const baseClasses = "flex items-start p-4 rounded-lg border transition-all";
  const variantClasses = {
    primary:
      "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800",
    secondary:
      "border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50",
  };

  return (
    <Link
      href={href}
      className={`${baseClasses} ${variantClasses[variant]} group`}
    >
      <div>
        <h3 className="text-lg font-medium text-neutral-900 dark:text-white">
          {title}
        </h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {description}
        </p>
      </div>
    </Link>
  );
}
