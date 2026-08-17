"use client";

import React from "react";
import { Pagination } from "@heroui/react";
import { Button } from "@heroui/react";
import { TextField, InputGroup, CloseButton } from "@heroui/react";
import { Chip } from "@heroui/react";
import { Dropdown, Label } from "@heroui/react";
import { Table } from "@heroui/react";
import type { Selection, SortDescriptor } from "react-aria-components";
import { Icon } from "@iconify/react";
import { Viagem } from "@/src/model/viagem";
import { formatDateBR } from "@/src/utils/date";
import { isValid } from "date-fns";
import TripDetailsModal from "./trip-details-modal";

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

const statusColorMap: Record<
  string,
  "default" | "accent" | "success" | "warning" | "danger"
> = {
  Finalizada: "success",
  "Em Andamento": "accent",
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
  const [selectedTrip, setSelectedTrip] = React.useState<Viagem | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
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

  // Função removida - agora usa o utilitário centralizado formatDateBR

  const calcularDuracao = (viagem: Viagem) => {
    if (!viagem.dataInicio || !viagem.dataFim) return "-";

    try {
      const inicio = new Date(viagem.dataInicio);
      const fim = new Date(viagem.dataFim);

      // Verifica se as datas são válidas
      if (!isValid(inicio) || !isValid(fim)) {
        console.warn(
          "Datas inválidas para cálculo de duração:",
          viagem.dataInicio,
          viagem.dataFim
        );
        return "-";
      }

      const diff = Math.abs(fim.getTime() - inicio.getTime());
      const minutos = Math.floor(diff / (1000 * 60));
      const horas = Math.floor(minutos / 60);
      const mins = minutos % 60;

      if (horas > 0) {
        return `${horas}h ${mins}min`;
      }
      return `${mins}min`;
    } catch (error) {
      console.error("Erro ao calcular duração:", error, viagem);
      return "-";
    }
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
                {formatDateBR(viagem.dataInicio)}
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
              variant="tertiary"
            >
              {viagem.status}
            </Chip>
          );
        case "actions":
          return (
            <div className="flex justify-end items-center">
              <Button
                size="sm"
                variant="tertiary"
                onPress={() => {
                  setSelectedTrip(viagem);
                  setIsModalOpen(true);
                }}
              >
                <Icon icon="solar:eye-linear" />
                Detalhes
              </Button>
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
          <TextField
            className="w-full sm:max-w-[44%]"
            value={filterValue}
            onChange={onSearchChange}
            aria-label="Buscar por passageiro, motorista, origem ou destino"
          >
            <InputGroup>
              <InputGroup.Prefix>
                <Icon icon="solar:magnifer-linear" className="text-default-400" />
              </InputGroup.Prefix>
              <InputGroup.Input placeholder="Buscar por passageiro, motorista, origem ou destino..." />
              {filterValue && (
                <InputGroup.Suffix>
                  <CloseButton aria-label="Limpar busca" onPress={() => onClear()} />
                </InputGroup.Suffix>
              )}
            </InputGroup>
          </TextField>
          <div className="flex gap-3">
            <Dropdown>
              <Button variant="tertiary" className="hidden sm:flex">
                Status
                <Icon icon="solar:alt-arrow-down-linear" />
              </Button>
              <Dropdown.Popover>
                <Dropdown.Menu
                  disallowEmptySelection
                  aria-label="Filtrar por status"
                  selectedKeys={statusFilter}
                  selectionMode="multiple"
                  onSelectionChange={setStatusFilter}
                >
                  {statusOptions.map((status) => (
                    <Dropdown.Item key={status.uid} id={status.uid} textValue={status.name} className="capitalize">
                      <Dropdown.ItemIndicator />
                      <Label>{status.name}</Label>
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
            <Dropdown>
              <Button variant="tertiary" className="hidden sm:flex">
                Colunas
                <Icon icon="solar:alt-arrow-down-linear" />
              </Button>
              <Dropdown.Popover>
                <Dropdown.Menu
                  disallowEmptySelection
                  aria-label="Colunas visíveis"
                  selectedKeys={visibleColumns}
                  selectionMode="multiple"
                  onSelectionChange={setVisibleColumns}
                >
                  {columns
                    .filter((column) => column.uid !== "passageiros")
                    .map((column) => (
                      <Dropdown.Item key={column.uid} id={column.uid} textValue={column.name} className="capitalize">
                        <Dropdown.ItemIndicator />
                        <Label>{column.name}</Label>
                      </Dropdown.Item>
                    ))}
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-sm">
            Total de {filteredItems.length}
            {filteredItems.length !== 1 ? " viagens" : " viagem"}
          </span>
          <label className="flex items-center text-default-400 text-sm">
            Linhas por página:
            <select
              className="bg-transparent outline-none text-default-400 text-sm ml-2"
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
    onClear,
    rowsPerPage,
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-sm text-default-400">
          {filteredItems.length} {filteredItems.length !== 1 ? "viagens" : "viagem"}
        </span>
        <Pagination>
          <Pagination.Content>
            <Pagination.Item>
              <Pagination.Previous isDisabled={page === 1} onPress={onPreviousPage}>
                <Pagination.PreviousIcon />
              </Pagination.Previous>
            </Pagination.Item>
            <Pagination.Item>
              <span className="px-2 text-sm text-default-500">
                {page} / {pages}
              </span>
            </Pagination.Item>
            <Pagination.Item>
              <Pagination.Next isDisabled={page === pages} onPress={onNextPage}>
                <Pagination.NextIcon />
              </Pagination.Next>
            </Pagination.Item>
          </Pagination.Content>
        </Pagination>
        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="tertiary"
            onPress={onPreviousPage}
          >
            Anterior
          </Button>
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="tertiary"
            onPress={onNextPage}
          >
            Próximo
          </Button>
        </div>
      </div>
    );
  }, [
    page,
    pages,
    filteredItems.length,
    onNextPage,
    onPreviousPage,
  ]);

  return (
    <>
      <TripDetailsModal
        viagem={selectedTrip}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTrip(null);
        }}
      />
      <Table className="bg-transparent shadow-none p-0">
        {topContent}
        <Table.ScrollContainer className="max-h-[calc(100vh-300px)]">
          <Table.Content
            aria-label="Tabela de viagens com paginação e filtros"
            sortDescriptor={sortDescriptor}
            onSortChange={setSortDescriptor}
          >
            <Table.Header columns={headerColumns}>
              {(column) => (
                <Table.Column
                  id={column.uid}
                  allowsSorting={column.sortable}
                  isRowHeader={column.uid === "passageiros"}
                  className={`sticky top-0 z-10 bg-gray-50 dark:bg-gray-800/50 ${column.uid === "actions" ? "text-center" : "text-start"}`}
                >
                  {column.name}
                </Table.Column>
              )}
            </Table.Header>
            <Table.Body
              items={sortedItems}
              renderEmptyState={() => (
                <p className="text-center py-4">Nenhuma viagem encontrada</p>
              )}
            >
              {(item) => (
                <Table.Row id={`${item.dataInicio}-${item.motorista}`}>
                  {headerColumns.map((column) => (
                    <Table.Cell key={column.uid}>
                      {renderCell(item, column.uid)}
                    </Table.Cell>
                  ))}
                </Table.Row>
              )}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
        <Table.Footer>{bottomContent}</Table.Footer>
      </Table>
    </>
  );
}
