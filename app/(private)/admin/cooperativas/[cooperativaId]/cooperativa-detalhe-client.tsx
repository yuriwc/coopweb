"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, InputGroup, Table, TextField, Tooltip, useOverlayState } from "@heroui/react";
import { Icon } from "@iconify/react";
import ShowToast from "@/src/components/Toast";
import { MotoristaResumo } from "@/src/model/admin";
import NovoMotoristaModal from "./novo-motorista-modal";
import VincularMotoristaModal from "./vincular-motorista-modal";

interface CooperativaDetalheClientProps {
  cooperativaId: string;
  nome: string | null;
  codigo: string | null;
  motoristas: MotoristaResumo[];
}

export default function CooperativaDetalheClient({
  cooperativaId,
  nome,
  codigo,
  motoristas,
}: CooperativaDetalheClientProps) {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const novoMotorista = useOverlayState();
  const vincularMotorista = useOverlayState();

  const motoristasFiltrados = useMemo(() => {
    if (!busca) return motoristas;
    const termo = busca.toLowerCase();
    return motoristas.filter((motorista) => (motorista.nome ?? "").toLowerCase().includes(termo));
  }, [motoristas, busca]);

  function handleMotoristaCriado() {
    novoMotorista.close();
    ShowToast({ color: "success", title: "Motorista cadastrado com sucesso" });
    router.refresh();
  }

  function handleMotoristaVinculado() {
    vincularMotorista.close();
    ShowToast({ color: "success", title: "Motorista vinculado à cooperativa" });
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-4 sm:p-8 max-w-6xl">
        <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button variant="secondary" onPress={() => router.push("/admin/cooperativas")}>
              ← Voltar
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {nome ?? "Cooperativa"}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {codigo ? (
                  <>
                    Código{" "}
                    <span className="font-mono tracking-widest font-semibold">{codigo}</span> ·{" "}
                  </>
                ) : null}
                {motoristas.length}{" "}
                {motoristas.length === 1 ? "motorista" : "motoristas"}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" onPress={vincularMotorista.open}>
              <Icon icon="solar:link-linear" className="w-4 h-4" />
              Vincular existente
            </Button>
            <Tooltip delay={0} isDisabled={codigo !== null}>
              <Tooltip.Trigger>
                <span>
                  <Button
                    variant="primary"
                    onPress={novoMotorista.open}
                    isDisabled={codigo === null}
                  >
                    <Icon icon="solar:user-plus-linear" className="w-4 h-4" />
                    Novo motorista
                  </Button>
                </span>
              </Tooltip.Trigger>
              <Tooltip.Content>
                <p>Não foi possível carregar o código da cooperativa — recarregue a página</p>
              </Tooltip.Content>
            </Tooltip>
          </div>
        </header>

        <Card>
          <Card.Header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-md font-semibold">Motoristas da cooperativa</p>
            <TextField
              value={busca}
              onChange={setBusca}
              aria-label="Buscar motorista por nome"
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
            {motoristasFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <Icon icon="solar:user-cross-linear" className="w-12 h-12 mx-auto text-muted" />
                <h3 className="text-lg font-semibold text-muted mt-4">
                  Nenhum motorista encontrado
                </h3>
                <p className="text-sm text-muted">
                  {busca
                    ? "Ajuste a busca ou cadastre um novo motorista."
                    : 'Cadastre o primeiro motorista em "Novo motorista".'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <Table.ScrollContainer>
                    <Table.Content aria-label="Motoristas vinculados à cooperativa">
                      <Table.Header>
                        <Table.Column isRowHeader>NOME</Table.Column>
                      </Table.Header>
                      <Table.Body items={motoristasFiltrados}>
                        {(motorista) => (
                          <Table.Row id={motorista.id}>
                            <Table.Cell>
                              <span className="text-sm font-medium">
                                {motorista.nome ?? (
                                  <span className="text-muted italic">não informado</span>
                                )}
                              </span>
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

      {codigo ? (
        <NovoMotoristaModal
          isOpen={novoMotorista.isOpen}
          onOpenChange={novoMotorista.setOpen}
          cooperativaCodigo={codigo}
          onSucesso={handleMotoristaCriado}
        />
      ) : null}

      <VincularMotoristaModal
        isOpen={vincularMotorista.isOpen}
        onOpenChange={vincularMotorista.setOpen}
        cooperativaId={cooperativaId}
        cooperativaNome={nome}
        onSucesso={handleMotoristaVinculado}
      />
    </div>
  );
}
