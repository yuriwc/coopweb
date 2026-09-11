"use client";

import { Funcionario } from "@/src/model/funcionario";
import {
  Button,
  Checkbox,
  Chip,
  CloseButton,
  InputGroup,
  Pagination,
  Table,
  TextField,
  Tooltip,
} from "@heroui/react";
import type { Key, Selection } from "react-aria-components";
import React, { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import FormViagemProgramada from "./modal/form-viagem-programada";
import FormViagem from "./modal/form-viagem";
import VincularCentroCustoModal from "./modal/form-vincular-centro-custo";
import CentroCustoModal from "./modal/form-centro-custo";
import { janelaPaginas } from "@/src/utils/paginacao";

const POR_PAGINA = 10;

interface TablePassegersProps {
  funcionarios: Funcionario[];
  empresa: string;
  token: string;
}

const TablePassegers = ({
  funcionarios,
  empresa,
  token,
}: TablePassegersProps) => {
  const router = useRouter();
  const currentPath = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalProgramadaOpen, setIsModalProgramadaOpen] = useState(false);
  const [isVincularCentroCustoModalOpen, setIsVincularCentroCustoModalOpen] =
    useState(false);
  const [isCentroCustoModalOpen, setIsCentroCustoModalOpen] = useState(false);
  const [selectedFuncionario, setSelectedFuncionario] =
    useState<Funcionario | null>(null);
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const [selecionados, setSelecionados] = useState<Set<Key>>(new Set());

  const ordenados = useMemo(
    () =>
      [...funcionarios].sort((a, b) =>
        a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" })
      ),
    [funcionarios]
  );

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return ordenados;

    return ordenados.filter((funcionario) =>
      [
        funcionario.name,
        funcionario.phone,
        funcionario.cidade,
        funcionario.estado,
        funcionario.centroCustoCodigo,
        funcionario.centroCustoDescricao,
      ].some((campo) => campo?.toLowerCase().includes(termo))
    );
  }, [ordenados, busca]);

  const paginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  // Página derivada: se a busca encurtar a lista, a página se ajusta sozinha.
  const paginaAtual = Math.min(pagina, paginas);
  const primeiro = (paginaAtual - 1) * POR_PAGINA;

  const visiveis = useMemo(
    () => filtrados.slice(primeiro, primeiro + POR_PAGINA),
    [filtrados, primeiro]
  );

  const passagers = useMemo(
    () => funcionarios.filter((funcionario) => selecionados.has(funcionario.id)),
    [funcionarios, selecionados]
  );

  // A tabela só enxerga a página atual; o que foi marcado nas outras continua valendo.
  const selecaoDaPagina = useMemo<Selection>(
    () =>
      new Set<Key>(
        visiveis
          .filter((funcionario) => selecionados.has(funcionario.id))
          .map((funcionario) => funcionario.id)
      ),
    [visiveis, selecionados]
  );

  const handleSelectionChange = useCallback(
    (selected: Selection) => {
      const daPagina = new Set<Key>(visiveis.map((funcionario) => funcionario.id));
      const novos = selected === "all" ? daPagina : new Set<Key>(selected);

      setSelecionados((atual) => {
        const mantidos = new Set<Key>(
          [...atual].filter((chave) => !daPagina.has(chave))
        );
        novos.forEach((chave) => mantidos.add(chave));
        return mantidos;
      });
    },
    [visiveis]
  );

  const handleBusca = useCallback((valor: string) => {
    setBusca(valor);
    setPagina(1);
  }, []);

  const limparBusca = useCallback(() => {
    setBusca("");
    setPagina(1);
  }, []);

  const handleCreate = useCallback(() => {
    router.push(`${currentPath}/passegers`);
  }, [router, currentPath]);

  const handleVincularCentroCusto = useCallback((funcionario: Funcionario) => {
    setSelectedFuncionario(funcionario);
    setIsVincularCentroCustoModalOpen(true);
  }, []);

  const handleRefresh = useCallback(() => {
    router.refresh();
  }, [router]);

  return (
    <div className="flex flex-col gap-4">
      {/* Busca + gestão de colaboradores */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <TextField
          className="w-full sm:max-w-xs"
          value={busca}
          onChange={handleBusca}
          aria-label="Buscar colaborador por nome, telefone, cidade, estado ou centro de custo"
        >
          <InputGroup>
            <InputGroup.Prefix>
              <Icon icon="solar:magnifer-linear" className="size-4 text-muted" />
            </InputGroup.Prefix>
            <InputGroup.Input placeholder="Buscar colaborador..." />
            {busca && (
              <InputGroup.Suffix>
                <CloseButton aria-label="Limpar busca" onPress={limparBusca} />
              </InputGroup.Suffix>
            )}
          </InputGroup>
        </TextField>

        <div className="flex flex-wrap items-center gap-2">
          <Button onPress={handleCreate} variant="tertiary" size="sm">
            <Icon icon="iconoir:plus" className="size-4" />
            Novo Colaborador
          </Button>

          <CentroCustoModal
            isOpen={isCentroCustoModalOpen}
            onOpen={setIsCentroCustoModalOpen}
            empresa={empresa}
            token={token}
            onSuccess={handleRefresh}
          />
        </div>
      </div>

      {/* Ações de viagem sobre os selecionados */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          onPress={() => setIsModalOpen(true)}
          variant="primary"
          size="sm"
          className="font-medium"
          isDisabled={passagers.length === 0}
        >
          <Icon icon="solar:car-linear" className="size-4" />
          Solicitar Viagem
        </Button>
        <Button
          onPress={() => setIsModalProgramadaOpen(true)}
          variant="secondary"
          size="sm"
          className="font-medium"
          isDisabled={passagers.length === 0}
        >
          <Icon icon="solar:calendar-linear" className="size-4" />
          Programar Viagem
        </Button>

        {passagers.length > 0 && (
          <span className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
            {passagers.length} selecionado{passagers.length > 1 ? "s" : ""}
            <button
              type="button"
              aria-label="Limpar seleção"
              className="opacity-70 transition-opacity hover:opacity-100"
              onClick={() => setSelecionados(new Set())}
            >
              <Icon icon="solar:close-circle-linear" className="size-3.5" />
            </button>
          </span>
        )}
      </div>

      <FormViagem
        token={token}
        isOpen={isModalOpen}
        onOpen={setIsModalOpen}
        passagers={passagers}
        empresa={empresa}
      />
      <FormViagemProgramada
        token={token}
        isOpen={isModalProgramadaOpen}
        onOpen={setIsModalProgramadaOpen}
        passagers={passagers}
        empresa={empresa}
      />

      {filtrados.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-default px-6 py-14 text-center dark:bg-default/30">
          <Icon
            icon="solar:users-group-rounded-linear"
            className="size-8 text-muted"
          />
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">
              Nenhum colaborador encontrado
            </p>
            <p className="mt-1 text-sm text-muted">
              {busca
                ? `Nada corresponde a "${busca}"`
                : "Cadastre o primeiro colaborador da empresa"}
            </p>
          </div>
          {busca && (
            <Button variant="tertiary" size="sm" onPress={limparBusca}>
              Limpar busca
            </Button>
          )}
        </div>
      ) : (
        <Table className="bg-transparent shadow-none p-0">
          <Table.ScrollContainer>
            <Table.Content
              aria-label="Tabela de funciários de uma empresa"
              selectionMode="multiple"
              selectedKeys={selecaoDaPagina}
              onSelectionChange={handleSelectionChange}
            >
              <Table.Header>
                <Table.Column className="bg-gray-50 dark:bg-gray-800/50">
                  <Checkbox slot="selection" aria-label="Selecionar todos">
                    <Checkbox.Content>
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                    </Checkbox.Content>
                  </Checkbox>
                </Table.Column>
                <Table.Column isRowHeader className="bg-gray-50 dark:bg-gray-800/50">Nome</Table.Column>
                <Table.Column className="bg-gray-50 dark:bg-gray-800/50">Telefone</Table.Column>
                <Table.Column className="bg-gray-50 dark:bg-gray-800/50">Cidade</Table.Column>
                <Table.Column className="bg-gray-50 dark:bg-gray-800/50">Estado</Table.Column>
                <Table.Column className="bg-gray-50 dark:bg-gray-800/50">Centro de Custo</Table.Column>
                <Table.Column className="bg-gray-50 dark:bg-gray-800/50">Ações</Table.Column>
              </Table.Header>
              <Table.Body items={visiveis}>
                {(item) => (
                  <Table.Row id={item.id}>
                    <Table.Cell>
                      <Checkbox slot="selection" aria-label={`Selecionar ${item.name}`}>
                        <Checkbox.Content>
                          <Checkbox.Control>
                            <Checkbox.Indicator />
                          </Checkbox.Control>
                        </Checkbox.Content>
                      </Checkbox>
                    </Table.Cell>
                    <Table.Cell>{item.name}</Table.Cell>
                    <Table.Cell>{item.phone || <span className="text-gray-400">—</span>}</Table.Cell>
                    <Table.Cell>{item.cidade || <span className="text-gray-400">—</span>}</Table.Cell>
                    <Table.Cell>{item.estado || <span className="text-gray-400">—</span>}</Table.Cell>
                    <Table.Cell>
                      {item.centroCustoCodigo ? (
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">
                            {item.centroCustoCodigo}
                          </span>
                          <span className="text-xs text-gray-500">
                            {item.centroCustoDescricao}
                          </span>
                        </div>
                      ) : (
                        <Chip size="sm" variant="tertiary" color="default">
                          Não vinculado
                        </Chip>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <Tooltip delay={0}>
                        <Tooltip.Trigger>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="tertiary"
                            aria-label={`${item.centroCustoCodigo ? "Alterar" : "Vincular"} centro de custo de ${item.name}`}
                            onPress={() => handleVincularCentroCusto(item)}
                          >
                            <Icon icon="solar:link-linear" className="size-4" />
                          </Button>
                        </Tooltip.Trigger>
                        <Tooltip.Content>
                          <p>
                            {item.centroCustoCodigo
                              ? "Alterar centro de custo"
                              : "Vincular centro de custo"}
                          </p>
                        </Tooltip.Content>
                      </Tooltip>
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      )}

      {/* Resumo + paginação */}
      {filtrados.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-muted">
            Mostrando {primeiro + 1}–{primeiro + visiveis.length} de{" "}
            {filtrados.length} colaborador{filtrados.length > 1 ? "es" : ""}
            {busca && " encontrados"}
          </p>

          {paginas > 1 && (
            <Pagination>
              <Pagination.Content>
                <Pagination.Item>
                  <Pagination.Previous
                    isDisabled={paginaAtual === 1}
                    onPress={() => setPagina(paginaAtual - 1)}
                  >
                    <Pagination.PreviousIcon />
                  </Pagination.Previous>
                </Pagination.Item>

                {janelaPaginas(paginaAtual, paginas).map((item, i) => (
                  <Pagination.Item key={`${item}-${i}`}>
                    {item === "..." ? (
                      <Pagination.Ellipsis />
                    ) : (
                      <Pagination.Link
                        isActive={item === paginaAtual}
                        aria-label={`Página ${item}`}
                        onPress={() => setPagina(item)}
                      >
                        {item}
                      </Pagination.Link>
                    )}
                  </Pagination.Item>
                ))}

                <Pagination.Item>
                  <Pagination.Next
                    isDisabled={paginaAtual === paginas}
                    onPress={() => setPagina(paginaAtual + 1)}
                  >
                    <Pagination.NextIcon />
                  </Pagination.Next>
                </Pagination.Item>
              </Pagination.Content>
            </Pagination>
          )}
        </div>
      )}

      {selectedFuncionario && (
        <VincularCentroCustoModal
          isOpen={isVincularCentroCustoModalOpen}
          onOpen={setIsVincularCentroCustoModalOpen}
          funcionario={selectedFuncionario}
          empresa={empresa}
          token={token}
          onSuccess={handleRefresh}
        />
      )}
    </div>
  );
};

export default TablePassegers;
