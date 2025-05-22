"use client";

import { useState } from "react";
import { Funcionario } from "@/src/model/funcionario";
import TipoViagem from "../tipoViagem";
import ShowToast from "@/src/components/Toast";
import SelectCooperativas from "../select/cooperativas";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";

interface Props {
  isOpen: boolean;
  onOpen: (open: boolean) => void;
  passagers: Funcionario[];
  empresa: string;
  token: string;
}

export default function TripRequestModal({
  isOpen,
  onOpen,
  passagers,
  empresa,
  token,
}: Props) {
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [cooperativa, setCooperativa] = useState<string>("");

  // Função de validação
  function validate() {
    const cidades = passagers.map((passager) => passager.cidade);

    if (!selectedPlan) {
      ShowToast({
        color: "danger",
        title: "Selecione um plano de viagem",
      });
      return false;
    }

    if (new Set(cidades).size !== 1) {
      ShowToast({
        color: "danger",
        title: "Todos os passageiros devem ser da mesma cidade!",
      });
      return false;
    }

    return true;
  }

  // Função para gerar os dados do request
  function generateDataToRequest() {
    const passagersID = passagers.map((passager) => passager.id);

    return {
      empresaID: empresa,
      tipoViagem: selectedPlan,
      cooperativaID: cooperativa,
      passageiros: passagersID,
    };
  }

  // Função para realizar a solicitação da viagem
  async function requestViagem() {
    const data = generateDataToRequest();

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER}/api/v1/viagem`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      await response.json();
      alert("Viagem solicitada com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao solicitar a viagem. Tente novamente mais tarde.");
    }
  }

  async function handleSolicitarViagem() {
    if (validate()) {
      await requestViagem();
      onOpen(false);
    }
  }

  return (
    <>
      <Button variant="faded" onPress={() => onOpen(true)}>
        Viagem Imediata
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpen}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h3 className="text-lg font-medium leading-6">
                  Solicitar Viagem
                </h3>
              </ModalHeader>
              <ModalBody>
                <section className="mb-6">
                  <SelectCooperativas
                    setCooperativa={setCooperativa}
                    empresa={empresa}
                    token={token}
                  />
                </section>
                <section className="mb-6">
                  <h4 className="mb-2 text-sm font-medium">Passageiros</h4>
                  <p className="mb-4 text-sm">
                    Quantidade de passageiros: {passagers.length}
                  </p>

                  <div className="space-y-3">
                    {passagers.map((passager) => (
                      <div
                        key={passager.id}
                        className="flex items-center space-x-3 border-b border-gray-100 py-2"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {passager.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {passager.phone}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
                <TipoViagem setSelectedPlan={setSelectedPlan} />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose} className="mr-2">
                  Cancelar
                </Button>
                <Button color="primary" onPress={handleSolicitarViagem}>
                  <span className="text-secondary">Solicitar Viagem</span>
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
