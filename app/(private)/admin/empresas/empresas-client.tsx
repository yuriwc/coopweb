"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, InputGroup, Table, TextField, useOverlayState } from "@heroui/react";
import { Icon } from "@iconify/react";
import ShowToast from "@/src/components/Toast";
import { EmpresaResumo } from "@/src/model/admin";
import { Cooperativa } from "@/src/model/cooperativas";
import NovaEmpresaModal from "./nova-empresa-modal";

interface EmpresasClientProps {
  empresas: EmpresaResumo[];
  cooperativas: Cooperativa[];
}

export default function EmpresasClient({ empresas, cooperativas }: EmpresasClientProps) {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const novaEmpresa = useOverlayState();

  const empresasFiltradas = useMemo(() => {
    if (!busca) return empresas;
    const termo = busca.toLowerCase();
    return empresas.filter((empresa) => empresa.nome.toLowerCase().includes(termo));
  }, [empresas, busca]);

  function handleCadastroSucesso() {
    novaEmpresa.close();
    ShowToast({ color: "success", title: "Empresa cadastrada com sucesso" });
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-4 sm:p-8 max-w-6xl">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Empresas</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {empresas.length} {empresas.length === 1 ? "empresa cadastrada" : "empresas cadastradas"}
            </p>
          </div>
          <Button
            variant="primary"
            onPress={novaEmpresa.open}
            isDisabled={cooperativas.length === 0}
          >
            <Icon icon="solar:add-circle-linear" className="w-4 h-4" />
            Nova empresa
          </Button>
        </header>

        {cooperativas.length === 0 ? (
          <Card className="mb-6 border border-warning bg-warning-soft">
            <Card.Content className="flex items-center gap-3 p-4">
              <Icon icon="solar:danger-triangle-linear" className="w-5 h-5 text-warning shrink-0" />
              <p className="text-sm text-warning">
                Toda empresa nasce vinculada a uma cooperativa. Cadastre uma cooperativa antes de
                cadastrar empresas.
              </p>
            </Card.Content>
          </Card>
        ) : null}

        <Card>
          <Card.Header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-md font-semibold">Lista de empresas</p>
            <TextField
              value={busca}
              onChange={setBusca}
              aria-label="Buscar empresa por nome"
              className="w-full sm:w-72"
            >
              <InputGroup>
                <InputGroup.Prefix>
                  <Icon icon="solar:magnifer-linear" className="text-muted" />
                </InputGroup.Prefix>
                <InputGroup.Input placeholder="Buscar por nome..." />
              </InputGroup>
            </TextField>
          </Card.Header>
          <Card.Content>
            {empresasFiltradas.length === 0 ? (
              <div className="text-center py-12">
                <Icon icon="solar:buildings-linear" className="w-12 h-12 mx-auto text-muted" />
                <h3 className="text-lg font-semibold text-muted mt-4">
                  Nenhuma empresa encontrada
                </h3>
                <p className="text-sm text-muted">
                  {busca
                    ? "Ajuste a busca ou cadastre uma nova empresa."
                    : 'Cadastre a primeira empresa em "Nova empresa".'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <Table.ScrollContainer>
                    <Table.Content aria-label="Lista de empresas cadastradas">
                      <Table.Header>
                        <Table.Column isRowHeader>NOME</Table.Column>
                        <Table.Column>AÇÕES</Table.Column>
                      </Table.Header>
                      <Table.Body items={empresasFiltradas}>
                        {(empresa) => (
                          <Table.Row id={empresa.id}>
                            <Table.Cell>
                              <span className="text-sm font-medium">{empresa.nome}</span>
                            </Table.Cell>
                            <Table.Cell>
                              <Button
                                size="sm"
                                variant="tertiary"
                                onPress={() => router.push(`/admin/empresas/${empresa.id}`)}
                              >
                                Gerenciar
                                <Icon icon="solar:arrow-right-linear" className="w-4 h-4" />
                              </Button>
                            </Table.Cell>
                          </Table.Row>
                        )}
                      </Table.Body>
                    </Table.Content>
                  </Table.ScrollContainer>
                </Table>
              </div>
            )}
          </Card.Content>
        </Card>
      </div>

      <NovaEmpresaModal
        isOpen={novaEmpresa.isOpen}
        onOpenChange={novaEmpresa.setOpen}
        cooperativas={cooperativas}
        onSucesso={handleCadastroSucesso}
      />
    </div>
  );
}
