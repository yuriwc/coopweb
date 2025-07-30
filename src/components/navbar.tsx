"use client";

import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/navbar";
import { Link } from "@heroui/link";
import { Avatar } from "@heroui/avatar";
import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ThemeSwitcher } from "./theme-switcher";
import { PendingRidesNotification } from "./PendingRidesNotification";

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
    <Navbar className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg rounded-none px-6 transition-all duration-300">
      {/* Modern gradient border */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-blue-400/20 via-purple-500/20 to-blue-400/20 animate-pulse" />

      <NavbarBrand className="group cursor-pointer">
        <div className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
          <CoopGoLogo />
        </div>
        <span className="text-base sm:text-lg font-bold tracking-[0.15em] uppercase bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent ml-3 transition-all duration-300 group-hover:tracking-wider">
          CoopGo
        </span>
      </NavbarBrand>

      <NavbarContent className="hidden sm:flex gap-1" justify="center">
        {isCooperativaRoute ? (
          <>
            <NavbarItem>
              <Link 
                color="foreground" 
                href={`/cooperativa/${cooperativaId}`}
                className="px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105 active:scale-95 cursor-pointer"
              >
                Dashboard
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link 
                color="foreground" 
                href={`/cooperativa/${cooperativaId}/programadas`}
                className="px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 hover:scale-105 active:scale-95 cursor-pointer"
              >
                Programações
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link 
                color="foreground" 
                href={`/cooperativa/${cooperativaId}/faturas`}
                className="px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 hover:scale-105 active:scale-95 cursor-pointer"
              >
                Faturas
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link 
                color="foreground" 
                href={`/cooperativa/${cooperativaId}/ride/realtime`}
                className="px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 hover:scale-105 active:scale-95 cursor-pointer"
              >
                Viagens
              </Link>
            </NavbarItem>
          </>
        ) : (
          <>
            <NavbarItem>
              <Link 
                color="foreground" 
                href={empresaId ? `/${empresaId}` : "/home"}
                className="px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105 active:scale-95 cursor-pointer"
              >
                Dashboard
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link
                color="foreground"
                href={empresaId ? `/${empresaId}/ride` : "/ride"}
                className="px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 hover:scale-105 active:scale-95 cursor-pointer"
              >
                Viagens
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link
                color="foreground"
                href={empresaId ? `/${empresaId}/vouchers/dashboard` : "/vouchers"}
                className="px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 hover:scale-105 active:scale-95 cursor-pointer"
              >
                Relatórios
              </Link>
            </NavbarItem>
          </>
        )}
        <NavbarItem>
          <Link 
            color="foreground" 
            href="/docs/webgo.html"
            className="px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 hover:scale-105 active:scale-95 cursor-pointer"
          >
            Manual
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent as="div" justify="end" className="gap-3">
        {isCooperativaRoute && cooperativaId && (
          <NavbarItem>
            <div className="transform transition-all duration-300 hover:scale-110">
              <PendingRidesNotification cooperativaId={cooperativaId} />
            </div>
          </NavbarItem>
        )}
        <NavbarItem>
          <div className="backdrop-blur-md bg-white/30 dark:bg-gray-800/30 border border-gray-200/30 dark:border-gray-600/30 rounded-2xl p-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/40 dark:hover:bg-gray-800/40 hover:scale-105">
            <ThemeSwitcher />
          </div>
        </NavbarItem>
        <div className="relative" ref={menuRef}>
          <div className="group">
            <Avatar
              isBordered
              as="button"
              className="transition-all duration-300 hover:scale-110 group-hover:shadow-lg ring-2 ring-transparent group-hover:ring-blue-400/50 dark:group-hover:ring-blue-500/50"
              color="secondary"
              name="Usuario"
              size="md"
              src="https://i.pravatar.cc/150?u=coopgo"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
          </div>

          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-3 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
              {/* Header */}
              <div className="px-4 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Usuario</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">usuario@coopgo.com</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <button
                  onClick={() => handleMenuItemClick("perfil")}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 cursor-pointer"
                >
                  <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  Meu Perfil
                </button>

                <button
                  onClick={() => handleMenuItemClick("configuracoes")}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 cursor-pointer"
                >
                  <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  Configurações
                </button>

                <button
                  onClick={() => handleMenuItemClick("empresa")}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 cursor-pointer"
                >
                  <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                  </svg>
                  Empresa
                </button>

                {/* Divider */}
                <div className="my-2 mx-4 border-t border-gray-200 dark:border-gray-600"></div>

                <button
                  onClick={() => handleMenuItemClick("logout")}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150 cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
                  Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </NavbarContent>
    </Navbar>
  );
}
