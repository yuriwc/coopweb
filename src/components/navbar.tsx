import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/navbar";
import { ThemeSwitcher } from "./theme-switcher";

export default function App() {
  return (
    <Navbar>
      <NavbarBrand>
        <p className="font-bold text-inherit">CoopGo</p>
      </NavbarBrand>

      <NavbarContent justify="end">
        <NavbarItem>
          <ThemeSwitcher />
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
