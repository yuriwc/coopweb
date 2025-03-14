import { Button } from "@heroui/button";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { usePathname } from "next/navigation";

const Menu = () => {
  const pathname = usePathname();
  return (
    <Dropdown>
      <DropdownTrigger>
        <Button variant="light">
          <svg height="20" width="17.5" viewBox="0 0 448 512">
            <path d="M0 96C0 78.3 14.3 64 32 64l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32L32 448c-17.7 0-32-14.3-32-32s14.3-32 32-32l384 0c17.7 0 32 14.3 32 32z" />
          </svg>
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Static Actions">
        <DropdownItem key="passegers" href={`${pathname}/passegers`}>
          Cadastrar
        </DropdownItem>
        <DropdownItem href="/passegers" key="copy">
          Importar
        </DropdownItem>
        <DropdownItem key="delete" className="text-danger" color="danger">
          Apagar
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default Menu;
