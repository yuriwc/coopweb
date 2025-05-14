import { useState } from "react";
import { Funcionario } from "@/src/model/funcionario";
import TipoViagem from "../tipoViagem";
import ShowToast from "@/src/components/Toast";

interface Props {
  isOpen: boolean;
  onOpen: (open: boolean) => void;
  passagers: Funcionario[];
  empresa: string;
}

export default function TripRequestModal({
  isOpen,
  onOpen,
  passagers,
  empresa,
}: Props) {
  const [selectedPlan, setSelectedPlan] = useState<string>("");

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
      cooperativaID: "77c73ddc-1331-427a-b2b2-031a55ff8a73",
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
            authorization: `Bearer ${process.env.NEXT_PUBLIC_TOKEN}`,
          },
          body: JSON.stringify(data),
        },
      );

      const result = await response.json();
      console.log(result);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={() => onOpen(false)}
        ></div>

        {/* Modal container */}
        <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all">
          {/* Modal header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Solicitar Viagem
            </h3>
          </div>

          {/* Modal body */}
          <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
            <section className="mb-6">
              <h4 className="mb-2 text-sm font-medium text-gray-700">
                Passageiros
              </h4>
              <p className="mb-4 text-sm text-gray-500">
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
                      <p className="text-xs text-gray-500">{passager.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <TipoViagem setSelectedPlan={setSelectedPlan} />
          </div>

          {/* Modal footer */}
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => onOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={handleSolicitarViagem}
              >
                Solicitar Viagem
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
