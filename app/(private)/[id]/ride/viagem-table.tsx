"use client";

import React from "react";
import { Pagination } from "@heroui/pagination";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Chip, ChipProps } from "@heroui/chip";
import {
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import {
  SortDescriptor,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Selection,
} from "@heroui/table";
import { Icon } from "@iconify/react";
import { Viagem } from "@/src/model/viagem";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Ícones SVG
interface IconProps extends React.SVGProps<SVGSVGElement> {
  strokeWidth?: number;
}

const SearchIcon = (props: IconProps) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path
      d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <path
      d="M22 22L20 20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
);

const ChevronDownIcon = ({ strokeWidth = 1.5, ...otherProps }: IconProps) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...otherProps}
  >
    <path
      d="m19.92 8.95-6.52 6.52c-.77.77-2.03.77-2.8 0L4.08 8.95"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={strokeWidth}
    />
  </svg>
);

const columns = [
  { name: "PASSAGEIROS", uid: "passageiros", sortable: true },
  { name: "MOTORISTA", uid: "motorista", sortable: true },
  { name: "ORIGEM", uid: "origem", sortable: true },
  { name: "DESTINO", uid: "destino", sortable: true },
  { name: "DATA/HORA", uid: "dataInicio", sortable: true },
  { name: "DURAÇÃO", uid: "duracao" },
  { name: "VALOR", uid: "preco", sortable: true },
  { name: "STATUS", uid: "status", sortable: true },
  { name: "AÇÕES", uid: "actions" },
];

const statusOptions = [
  { name: "Finalizada", uid: "Finalizada" },
  { name: "Em Andamento", uid: "Em Andamento" },
  { name: "Cancelada", uid: "Cancelada" },
  { name: "Agendada", uid: "Agendada" },
];

const statusColorMap: Record<string, ChipProps["color"]> = {
  Finalizada: "success",
  "Em Andamento": "primary",
  Cancelada: "danger",
  Agendada: "warning",
};

const INITIAL_VISIBLE_COLUMNS = [
  "passageiros",
  "motorista",
  "origem",
  "destino",
  "dataInicio",
  "preco",
  "status",
  "actions",
];

interface Props {
  viagens: Viagem[];
}

export default function ViagemTable({ viagens }: Props) {
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(
    new Set([])
  );
  const [visibleColumns, setVisibleColumns] = React.useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [statusFilter, setStatusFilter] = React.useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "dataInicio",
    direction: "descending",
  });
  const [page, setPage] = React.useState(1);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;
    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredViagens = [...viagens];

    if (hasSearchFilter) {
      filteredViagens = filteredViagens.filter(
        (viagem) =>
          viagem.passageiros.some((passageiro) =>
            passageiro.toLowerCase().includes(filterValue.toLowerCase())
          ) ||
          viagem.motorista.toLowerCase().includes(filterValue.toLowerCase()) ||
          viagem.origem.toLowerCase().includes(filterValue.toLowerCase()) ||
          viagem.destino.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    if (
      statusFilter !== "all" &&
      Array.from(statusFilter).length !== statusOptions.length
    ) {
      filteredViagens = filteredViagens.filter((viagem) =>
        Array.from(statusFilter).includes(viagem.status)
      );
    }

    return filteredViagens;
  }, [viagens, filterValue, statusFilter, hasSearchFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage) || 1;

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a: Viagem, b: Viagem) => {
      const first = a[sortDescriptor.column as keyof Viagem] as string | number;
      const second = b[sortDescriptor.column as keyof Viagem] as
        | string
        | number;
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return format(data, "dd/MM/yyyy HH:mm", { locale: ptBR });
  };

  const calcularDuracao = (viagem: Viagem) => {
    const inicio = new Date(viagem.dataInicio);
    const fim = new Date(viagem.dataFim);
    const diff = Math.abs(fim.getTime() - inicio.getTime());
    const minutos = Math.floor(diff / (1000 * 60));
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;

    if (horas > 0) {
      return `${horas}h ${mins}min`;
    }
    return `${mins}min`;
  };

  const formatarValor = (valor: number) =>
    valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  const renderCell = React.useCallback(
    (viagem: Viagem, columnKey: React.Key) => {
      const cellValue = viagem[columnKey as keyof Viagem];

      switch (columnKey) {
        case "passageiros":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-sm capitalize">
                {viagem.passageiros.length > 2
                  ? `${viagem.passageiros.slice(0, 2).join(", ")} +${
                      viagem.passageiros.length - 2
                    }`
                  : viagem.passageiros.join(", ")}
              </p>
              <p className="text-bold text-xs capitalize text-default-400">
                {viagem.passageiros.length} passageiro
                {viagem.passageiros.length > 1 ? "s" : ""}
              </p>
            </div>
          );
        case "motorista":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-sm capitalize">{viagem.motorista}</p>
            </div>
          );
        case "origem":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-sm">{viagem.origem}</p>
            </div>
          );
        case "destino":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-sm">{viagem.destino}</p>
            </div>
          );
        case "dataInicio":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-sm">
                {formatarData(viagem.dataInicio)}
              </p>
            </div>
          );
        case "duracao":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-sm">{calcularDuracao(viagem)}</p>
            </div>
          );
        case "preco":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-sm">{formatarValor(viagem.preco)}</p>
            </div>
          );
        case "status":
          return (
            <Chip
              className="capitalize"
              color={statusColorMap[viagem.status] || "default"}
              size="sm"
              variant="flat"
            >
              {viagem.status}
            </Chip>
          );
        case "actions":
          return (
            <div className="relative flex justify-end items-center gap-2">
              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly size="sm" variant="light">
                    <Icon
                      icon="solar:menu-dots-vertical-linear"
                      className="text-default-300"
                    />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem
                    key={`visualizar`}
                    startContent={<Icon icon="solar:eye-linear" />}
                  >
                    Visualizar
                  </DropdownItem>
                  <DropdownItem
                    key={`editar`}
                    startContent={<Icon icon="solar:map-point-linear" />}
                  >
                    Ver Rota
                  </DropdownItem>
                  <DropdownItem
                    key={`cancelar`}
                    startContent={<Icon icon="solar:download-linear" />}
                    className="text-danger"
                    color="danger"
                  >
                    Exportar
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          );
        default:
          return cellValue;
      }
    },
    []
  );

  const onNextPage = React.useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = React.useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setPage(1);
    },
    []
  );

  const onSearchChange = React.useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Buscar por passageiro, motorista, origem ou destino..."
            startContent={<SearchIcon />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
            variant="bordered"
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button endContent={<ChevronDownIcon />} variant="flat">
                  Status
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={statusFilter}
                selectionMode="multiple"
                onSelectionChange={setStatusFilter}
              >
                {statusOptions.map((status) => (
                  <DropdownItem key={status.uid} className="capitalize">
                    {status.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button endContent={<ChevronDownIcon />} variant="flat">
                  Colunas
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}
              >
                {columns.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {column.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Button
              color="primary"
              endContent={<Icon icon="solar:download-linear" />}
            >
              Exportar
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total de {filteredItems.length} viagem
            {filteredItems.length !== 1 ? "s" : ""}
          </span>
          <label className="flex items-center text-default-400 text-small">
            Linhas por página:
            <select
              className="bg-transparent outline-none text-default-400 text-small ml-2"
              onChange={onRowsPerPageChange}
              value={rowsPerPage}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    filterValue,
    statusFilter,
    visibleColumns,
    onSearchChange,
    onRowsPerPageChange,
    filteredItems.length,
    hasSearchFilter,
    onClear,
    rowsPerPage,
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeys === "all"
            ? "Todos os itens selecionados"
            : `${selectedKeys.size} de ${filteredItems.length} selecionados`}
        </span>
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
        />
        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onPreviousPage}
          >
            Anterior
          </Button>
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onNextPage}
          >
            Próximo
          </Button>
        </div>
      </div>
    );
  }, [
    selectedKeys,
    items.length,
    page,
    pages,
    hasSearchFilter,
    filteredItems.length,
    onNextPage,
    onPreviousPage,
  ]);

  return (
    <Table
      isHeaderSticky
      aria-label="Tabela de viagens com paginação e filtros"
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
      classNames={{
        wrapper: "max-h-[calc(100vh-300px)]",
      }}
      selectedKeys={selectedKeys}
      selectionMode="multiple"
      sortDescriptor={sortDescriptor}
      topContent={topContent}
      topContentPlacement="outside"
      onSelectionChange={setSelectedKeys}
      onSortChange={setSortDescriptor}
    >
      <TableHeader columns={headerColumns}>
        {(column) => (
          <TableColumn
            key={column.uid}
            align={column.uid === "actions" ? "center" : "start"}
            allowsSorting={column.sortable}
          >
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody emptyContent={"Nenhuma viagem encontrada"} items={sortedItems}>
        {(item) => (
          <TableRow key={`${item.dataInicio}-${item.motorista}`}>
            {(columnKey) => (
              <TableCell>{renderCell(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
