"use client";

import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/navbar";
import { Link } from "@heroui/link";
import { Avatar } from "@heroui/avatar";
import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ThemeSwitcher } from "./theme-switcher";

export const CoopGoLogo = () => {
  return (
    <svg fill="none" height="36" viewBox="0 0 32 32" width="36">
      <path
        clipRule="evenodd"
        d="M16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4ZM13 12C13 10.8954 13.8954 10 15 10H17C18.1046 10 19 10.8954 19 12V20C19 21.1046 18.1046 22 17 22H15C13.8954 22 13 21.1046 13 20V12Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
};

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

  const handleMenuItemClick = (action: string) => {
    setIsMenuOpen(false);

    if (action === "logout") {
      handleLogout();
      return;
    }

    // Aqui você pode implementar as outras ações específicas
  };

  return (
    <Navbar className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/20 dark:bg-white/10 border-b border-white/30 dark:border-white/20 shadow-xl rounded-none px-4">
      {/* Crystalline border effect */}
      <div className="absolute bottom-0 left-1/4 right-1/4 h-px bg-linear-to-r from-transparent via-blue-300/50 dark:via-white/30 to-transparent" />

      <NavbarBrand>
        <CoopGoLogo />
        <span className="text-base sm:text-lg font-bold tracking-[0.15em] uppercase bg-linear-to-r from-blue-600 via-sky-600 to-indigo-600 dark:from-blue-400 dark:via-sky-400 dark:to-indigo-400 bg-clip-text text-transparent ml-2">
          CoopGo
        </span>
      </NavbarBrand>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {isCooperativaRoute ? (
          <>
            <NavbarItem>
              <Link color="foreground" href={`/cooperativa/${cooperativaId}`}>
                Dashboard
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link color="foreground" href={`/cooperativa/${cooperativaId}/programadas`}>
                Programações
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link color="foreground" href={`/cooperativa/${cooperativaId}/faturas`}>
                Faturas
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link color="foreground" href={`/cooperativa/${cooperativaId}/ride/realtime`}>
                Viagens
              </Link>
            </NavbarItem>
          </>
        ) : (
          <>
            <NavbarItem>
              <Link color="foreground" href={empresaId ? `/${empresaId}` : "/home"}>
                Dashboard
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link
                color="foreground"
                href={empresaId ? `/${empresaId}/ride` : "/ride"}
              >
                Viagens
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link
                color="foreground"
                href={empresaId ? `/${empresaId}/vouchers/dashboard` : "/vouchers"}
              >
                Relatórios
              </Link>
            </NavbarItem>
          </>
        )}
        <NavbarItem>
          <Link color="foreground" href="/docs/webgo.html">
            Manual
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent as="div" justify="end" className="gap-2">
        <NavbarItem>
          <div className="backdrop-blur-sm bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 rounded-xl p-1 shadow-lg">
            <ThemeSwitcher />
          </div>
        </NavbarItem>
        <div className="relative" ref={menuRef}>
          <Avatar
            isBordered
            as="button"
            className="transition-transform hover:scale-110"
            color="secondary"
            name="Usuario"
            size="md"
            src="https://i.pravatar.cc/150?u=coopgo"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          />

          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 backdrop-blur-md bg-white/90 dark:bg-gray-800/90 border border-white/30 dark:border-white/20 rounded-xl shadow-xl z-50">
              <div className="py-2">
                <div className="px-4 py-2 border-b border-white/20 dark:border-white/10">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Usuario
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    usuario@coopgo.com
                  </p>
                </div>

                <button
                  onClick={() => handleMenuItemClick("perfil")}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
                >
                  👤 Meu Perfil
                </button>

                <button
                  onClick={() => handleMenuItemClick("configuracoes")}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
                >
                  ⚙️ Configurações
                </button>

                <button
                  onClick={() => handleMenuItemClick("empresa")}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
                >
                  🏢 Empresa
                </button>

                <div className="border-t border-white/20 dark:border-white/10 mt-1 pt-1">
                  <button
                    onClick={() => handleMenuItemClick("logout")}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    🚪 Sair
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </NavbarContent>
    </Navbar>
  );
}
