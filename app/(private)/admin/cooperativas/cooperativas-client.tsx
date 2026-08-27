"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, InputGroup, Table, TextField, useOverlayState } from "@heroui/react";
import { Icon } from "@iconify/react";
import ShowToast from "@/src/components/Toast";
import { Cooperativa } from "@/src/model/cooperativas";
import NovaCooperativaModal from "./nova-cooperativa-modal";

interface CooperativasClientProps {
  cooperativas: Cooperativa[];
}

export default function CooperativasClient({ cooperativas }: CooperativasClientProps) {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const novaCooperativa = useOverlayState();

  const cooperativasFiltradas = useMemo(() => {
    if (!busca) return cooperativas;
    const termo = busca.toLowerCase();
    return cooperativas.filter(
      (cooperativa) =>
        cooperativa.nome.toLowerCase().includes(termo) ||
        (cooperativa.codigo ?? "").includes(termo),
    );
  }, [cooperativas, busca]);

  function handleCadastroSucesso(codigo: string) {
    novaCooperativa.close();
    ShowToast({
      color: "success",
      title: "Cooperativa cadastrada",
      description: `Código de acesso: ${codigo}`,
    });
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-4 sm:p-8 max-w-6xl">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Cooperativas
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {cooperativas.length}{" "}
              {cooperativas.length === 1 ? "cooperativa cadastrada" : "cooperativas cadastradas"}
            </p>
          </div>
          <Button variant="primary" onPress={novaCooperativa.open}>
            <Icon icon="solar:add-circle-linear" className="w-4 h-4" />
            Nova cooperativa
          </Button>
        </header>

        <Card>
          <Card.Header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-md font-semibold">Lista de cooperativas</p>
            <TextField
              value={busca}
              onChange={setBusca}
              aria-label="Buscar cooperativa por nome ou código"
              className="w-full sm:w-72"
            >
              <InputGroup>
                <InputGroup.Prefix>
                  <Icon icon="solar:magnifer-linear" className="text-muted" />
                </InputGroup.Prefix>
                <InputGroup.Input placeholder="Buscar por nome ou código..." />
              </InputGroup>
            </TextField>
          </Card.Header>
          <Card.Content>
            {cooperativasFiltradas.length === 0 ? (
              <div className="text-center py-12">
                <Icon
                  icon="solar:users-group-two-rounded-linear"
                  className="w-12 h-12 mx-auto text-muted"
                />
                <h3 className="text-lg font-semibold text-muted mt-4">
                  Nenhuma cooperativa encontrada
                </h3>
                <p className="text-sm text-muted">
                  {busca
                    ? "Ajuste a busca ou cadastre uma nova cooperativa."
                    : 'Cadastre a primeira cooperativa em "Nova cooperativa".'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <Table.ScrollContainer>
                    <Table.Content aria-label="Lista de cooperativas cadastradas">
                      <Table.Header>
                        <Table.Column isRowHeader>NOME</Table.Column>
                        <Table.Column>CÓDIGO</Table.Column>
                        <Table.Column>AÇÕES</Table.Column>
                      </Table.Header>
                      <Table.Body items={cooperativasFiltradas}>
                        {(cooperativa) => (
                          <Table.Row id={cooperativa.id}>
                            <Table.Cell>
                              <span className="text-sm font-medium">{cooperativa.nome}</span>
                            </Table.Cell>
                            <Table.Cell>
                              {cooperativa.codigo ? (
                                <span className="font-mono text-sm tracking-widest font-semibold">
                                  {cooperativa.codigo}
                                </span>
                              ) : (
                                <span className="text-muted italic text-sm">sem código</span>
                              )}
                            </Table.Cell>
                            <Table.Cell>
                              <Button
                                size="sm"
                                variant="tertiary"
                                onPress={() => router.push(`/admin/cooperativas/${cooperativa.id}`)}
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

      <NovaCooperativaModal
        isOpen={novaCooperativa.isOpen}
        onOpenChange={novaCooperativa.setOpen}
        onSucesso={handleCadastroSucesso}
      />
    </div>
  );
}
