"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Input } from "@heroui/input";
import { Tooltip } from "@heroui/tooltip";
import { Icon } from "@iconify/react";
import { useDisclosure } from "@heroui/modal";
import ShowToast from "../../../../../src/components/Toast";
import { MotoristaCooperativa } from "../../../../../src/model/motorista";
import MotoristasTable from "./motoristas-table";
import NovoMotoristaModal from "./modal/novo-motorista-modal";
import VincularVeiculoModal from "./modal/vincular-veiculo-modal";
import BloquearMotoristaModal from "./modal/bloquear-motorista-modal";
import ReativarMotoristaModal from "./modal/reativar-motorista-modal";

interface MotoristasClientProps {
  cooperativaId: string;
  cooperativaCodigo: string | null;
  motoristasIniciais: MotoristaCooperativa[];
  token: string;
}

export default function MotoristasClient({
  cooperativaCodigo,
  motoristasIniciais,
  token,
}: MotoristasClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const novoMotoristaDisclosure = useDisclosure();
  const [motoristaVeiculo, setMotoristaVeiculo] = useState<MotoristaCooperativa | null>(null);
  const [motoristaBloqueio, setMotoristaBloqueio] = useState<MotoristaCooperativa | null>(null);
  const [motoristaReativacao, setMotoristaReativacao] = useState<MotoristaCooperativa | null>(null);

  const motoristasFiltrados = useMemo(() => {
    if (!searchTerm) return motoristasIniciais;
    const termo = searchTerm.toLowerCase();
    return motoristasIniciais.filter((motorista) => {
      const nomeMatch = motorista.nome?.toLowerCase().includes(termo) ?? false;
      const cpfMatch = motorista.cpf.toLowerCase().includes(termo);
      return nomeMatch || cpfMatch;
    });
  }, [motoristasIniciais, searchTerm]);

  function handleCadastroManualSucesso() {
    novoMotoristaDisclosure.onClose();
    ShowToast({ color: "success", title: "Motorista cadastrado com sucesso" });
    router.refresh();
  }

  function handleImportacaoSucesso() {
    ShowToast({ color: "success", title: "Planilha importada com sucesso" });
    router.refresh();
  }

  function handleVeiculoSucesso() {
    setMotoristaVeiculo(null);
    ShowToast({ color: "success", title: "Veículo vinculado com sucesso" });
    router.refresh();
  }

  function handleBloqueioSucesso() {
    setMotoristaBloqueio(null);
    ShowToast({
      color: "success",
      title: "Motorista bloqueado",
      description: "Corridas em andamento não são interrompidas pelo bloqueio.",
    });
    router.refresh();
  }

  function handleReativacaoSucesso() {
    setMotoristaReativacao(null);
    ShowToast({ color: "success", title: "Motorista reativado" });
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-4 sm:p-8 max-w-7xl">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button variant="bordered" onPress={() => router.back()}>
              ← Voltar
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Gestão de Motoristas
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Cadastro, veículos e bloqueio · {motoristasIniciais.length} motoristas
              </p>
            </div>
          </div>

          <Tooltip
            content="Não foi possível carregar o código da cooperativa — recarregue a página"
            isDisabled={cooperativaCodigo !== null}
          >
            <span>
              <Button
                color="primary"
                startContent={<Icon icon="solar:user-plus-linear" />}
                isDisabled={cooperativaCodigo === null}
                onPress={novoMotoristaDisclosure.onOpen}
              >
                Novo motorista
              </Button>
            </span>
          </Tooltip>
        </header>

        <Card className="mb-6">
          <CardBody>
            <Input
              placeholder="Buscar por nome ou CPF..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              startContent={<Icon icon="solar:magnifer-linear" className="text-default-400" />}
              isClearable
              onClear={() => setSearchTerm("")}
            />
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <MotoristasTable
              motoristas={motoristasFiltrados}
              onVincularVeiculo={setMotoristaVeiculo}
              onBloquear={setMotoristaBloqueio}
              onReativar={setMotoristaReativacao}
            />
          </CardBody>
        </Card>
      </div>

      {cooperativaCodigo ? (
        <NovoMotoristaModal
          isOpen={novoMotoristaDisclosure.isOpen}
          onOpenChange={novoMotoristaDisclosure.onOpenChange}
          cooperativaCodigo={cooperativaCodigo}
          token={token}
          onCadastroManualSucesso={handleCadastroManualSucesso}
          onImportacaoSucesso={handleImportacaoSucesso}
        />
      ) : null}

      <VincularVeiculoModal
        isOpen={motoristaVeiculo !== null}
        onOpenChange={(open) => !open && setMotoristaVeiculo(null)}
        motorista={motoristaVeiculo}
        token={token}
        onSucesso={handleVeiculoSucesso}
      />

      <BloquearMotoristaModal
        isOpen={motoristaBloqueio !== null}
        onOpenChange={(open) => !open && setMotoristaBloqueio(null)}
        motorista={motoristaBloqueio}
        token={token}
        onSucesso={handleBloqueioSucesso}
      />

      <ReativarMotoristaModal
        isOpen={motoristaReativacao !== null}
        onOpenChange={(open) => !open && setMotoristaReativacao(null)}
        motorista={motoristaReativacao}
        token={token}
        onSucesso={handleReativacaoSucesso}
      />
    </div>
  );
}
