"use client";

import { Toast } from "@heroui/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/navigation";
import { RouterProvider } from "react-aria-components";

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <RouterProvider navigate={router.push}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        storageKey="coopweb-theme"
      >
        <Toast.Provider />
        {children}
      </NextThemesProvider>
    </RouterProvider>
  );
}
