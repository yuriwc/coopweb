import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/navbar";
import { ThemeSwitcher } from "./theme-switcher";

export default function App() {
  return (
    <Navbar className="border-b-[1px] border dark:border-white dark:bg-black rounded-none px-4">
      <NavbarBrand>
        <span className="text-base sm:text-lg font-light tracking-[0.25em] uppercase dark:text-white">
          CoopGo
        </span>
      </NavbarBrand>
      <NavbarContent justify="end">
        <NavbarItem>
          <ThemeSwitcher />
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
