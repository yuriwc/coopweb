import { Card } from "@heroui/card";
import Link from "next/link";

interface ActionButtonProps {
  title: string;
  description: string;
  href: string;
  variant?: "primary" | "secondary";
}

export function ActionButton({ title, description, href }: ActionButtonProps) {
  return (
    <Link href={href} className="block w-full h-full">
      <Card
        isHoverable
        className="w-full h-full min-h-[180px] border border-black dark:border-white rounded-none bg-white dark:bg-black p-6 flex flex-col justify-center items-center transition-all duration-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 group"
      >
        <span className="text-base sm:text-lg font-light tracking-[0.18em] uppercase text-black dark:text-white mb-2 text-center w-full overflow-hidden text-ellipsis whitespace-nowrap">
          {title}
        </span>
        <span className="text-sm font-light tracking-[0.12em] text-black/70 dark:text-white/70 text-center w-full overflow-hidden text-ellipsis whitespace-nowrap">
          {description}
        </span>
      </Card>
    </Link>
  );
}
