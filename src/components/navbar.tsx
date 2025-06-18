import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/navbar";
import { ThemeSwitcher } from "./theme-switcher";

export default function App() {
  return (
    <Navbar className="backdrop-blur-md bg-white/20 dark:bg-white/10 border-b border-white/30 dark:border-white/20 shadow-xl rounded-none px-4 relative">
      {/* Crystalline border effect */}
      <div className="absolute bottom-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-blue-300/50 dark:via-white/30 to-transparent" />

      <NavbarBrand>
        <span className="text-base sm:text-lg font-bold tracking-[0.15em] uppercase bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 dark:from-blue-400 dark:via-sky-400 dark:to-indigo-400 bg-clip-text text-transparent">
          CoopGo
        </span>
      </NavbarBrand>
      <NavbarContent justify="end">
        <NavbarItem>
          <div className="backdrop-blur-sm bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 rounded-xl p-1 shadow-lg">
            <ThemeSwitcher />
          </div>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
