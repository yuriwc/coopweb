"use client";

import { Link, Avatar } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ThemeSwitcher } from "./theme-switcher";
import { PendingRidesNotification } from "./PendingRidesNotification";

export const CoopGoLogo = () => {
  return (
    <svg fill="none" height="32" viewBox="0 0 32 32" width="32">
      <path
        clipRule="evenodd"
        d="M16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4ZM13 12C13 10.8954 13.8954 10 15 10H17C18.1046 10 19 10.8954 19 12V20C19 21.1046 18.1046 22 17 22H15C13.8954 22 13 21.1046 13 20V12Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
};

interface NavLink {
  label: string;
  href: string;
  /** Rota "raiz" (Dashboard) só marca ativo em correspondência exata, senão fica ativa em toda sub-rota. */
  exact?: boolean;
}

function NavLinkItem({ link, pathname }: { link: NavLink; pathname: string }) {
  const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);

  return (
    <Link
      href={link.href}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
        active
          ? "bg-accent-soft text-accent dark:bg-accent-soft/30 dark:text-accent"
          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
    >
      {link.label}
    </Link>
  );
}

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [cooperativaId, setCooperativaId] = useState<string | null>(null);
  const [isCooperativaRoute, setIsCooperativaRoute] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Extrair IDs da URL atual - só no cliente para evitar hydration mismatch
  useEffect(() => {
    const segments = pathname.split("/");

    // Verificar se é uma rota de cooperativa (/cooperativa/[id]/...)
    if (segments[1] === "cooperativa" && segments[2]) {
      setIsCooperativaRoute(true);
      setCooperativaId(segments[2]);
      setEmpresaId(null);
    }
    // Se está em uma rota privada de empresa, o ID da empresa está na posição 1
    else if (
      segments.length > 1 &&
      segments[1] !== "home" &&
      segments[1] !== "signin" &&
      segments[1] !== "signup" &&
      segments[1] !== "cooperativa"
    ) {
      setIsCooperativaRoute(false);
      setEmpresaId(segments[1]);
      setCooperativaId(null);
    } else {
      setIsCooperativaRoute(false);
      setEmpresaId(null);
      setCooperativaId(null);
    }
  }, [pathname]);

  // Fechar menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    // Remove o token do cookie
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // Navega para a página inicial
    router.push("/");

    setIsMenuOpen(false);
  };

  const cooperativaLinks: NavLink[] = [
    { label: "Dashboard", href: `/cooperativa/${cooperativaId}`, exact: true },
    { label: "Programações", href: `/cooperativa/${cooperativaId}/programadas` },
    { label: "Faturas", href: `/cooperativa/${cooperativaId}/faturas` },
    { label: "Viagens", href: `/cooperativa/${cooperativaId}/ride/realtime` },
  ];

  const empresaLinks: NavLink[] = [
    { label: "Dashboard", href: empresaId ? `/${empresaId}` : "/home", exact: true },
    { label: "Viagens", href: empresaId ? `/${empresaId}/ride` : "/ride" },
    { label: "Relatórios", href: empresaId ? `/${empresaId}/vouchers/dashboard` : "/vouchers" },
  ];

  const links = isCooperativaRoute ? cooperativaLinks : empresaLinks;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm px-6">
      <div className="flex items-center shrink-0">
        <CoopGoLogo />
        <span className="text-base sm:text-lg font-bold tracking-[0.1em] uppercase text-accent dark:text-accent ml-3">
          CoopGo
        </span>
      </div>

      <div className="hidden sm:flex items-center gap-1 flex-1 justify-center">
        {links.map((link) => (
          <NavLinkItem key={link.label} link={link} pathname={pathname} />
        ))}
        <NavLinkItem
          link={{ label: "Manual", href: "/docs/webgo.html" }}
          pathname={pathname}
        />
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {isCooperativaRoute && cooperativaId && (
          <PendingRidesNotification cooperativaId={cooperativaId} />
        )}
        <ThemeSwitcher />
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            className="cursor-pointer"
            aria-label="Menu do usuário"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Avatar size="md" color="default">
              <Avatar.Fallback>U</Avatar.Fallback>
            </Avatar>
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-3 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150 cursor-pointer"
              >
                <Icon icon="solar:logout-2-linear" className="w-5 h-5" />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
