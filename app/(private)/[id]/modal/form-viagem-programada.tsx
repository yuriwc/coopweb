import { Funcionario } from "@/src/model/funcionario";
import { Button } from "@heroui/button";
import TipoViagem from "../tipoViagem";
import { User } from "@heroui/user";
import { useState } from "react";
import { DateValue, RangeCalendar, RangeValue } from "@heroui/calendar";
import {
  today,
  getLocalTimeZone,
  isWeekend,
  getDayOfWeek,
} from "@internationalized/date";
import { Checkbox } from "@heroui/checkbox";
import { useLocale } from "@react-aria/i18n";
import { TimeInput, TimeInputValue } from "@heroui/date-input";
import SelectCooperativas from "../select/cooperativas";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import ShowToast from "@/src/components/Toast";

interface Props {
  isOpen: boolean;
  onOpen: (open: boolean) => void;
  passagers: Funcionario[];
  empresa: string;
  token: string;
}

export default function App({
  isOpen,
  onOpen,
  passagers,
  empresa,
  token,
}: Props) {
  const { locale } = useLocale();
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [evitarFinsDeSemana, setEvitarFinsDeSemana] = useState(false);
  const [evitarDomingos, setEvitarDomingos] = useState(false);
  const [horaViagem, setHoraViagem] = useState<TimeInputValue | null>(null);
  const [horaRetorno, setHoraRetorno] = useState<TimeInputValue | null>(null);
  const [cooperativa, setCooperativa] = useState<string>("");
  const [value, setValue] = useState<RangeValue<DateValue> | null>({
    start: today(getLocalTimeZone()),
    end: today(getLocalTimeZone()).add({ weeks: 4 }),
  });

  // Função de validação
  function validate() {
    const cidades = passagers.map((passager) => passager.cidade);

    if (!selectedPlan) {
      ShowToast({
        color: "danger",
        title: "Selecione um plano de viagem!",
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

    if (selectedPlan === "APANHA_E_RETORNO" && !horaRetorno) {
      ShowToast({
        color: "danger",
        title: "Informe a hora do retorno!",
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
      dataInicial: value?.start,
      dataFinal: value?.end,
      horaViagem,
      horaRetorno:
        selectedPlan === "APANHA_E_RETORNO" ? horaRetorno : undefined,
    };
  }

  // Função para realizar a solicitação da viagem
  async function requestViagem() {
    const data = generateDataToRequest();

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER}/api/v1/programacao/criar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        console.error("Error response:", response.statusText);
        ShowToast({
          color: "danger",
          title: "Erro ao solicitar a viagem. Tente novamente mais tarde.",
        });
        return;
      }
      // Se a resposta for bem-sucedida, faça algo com os dados retornados
      if (response.ok) {
        // fechar o modal
        onOpen(false);
        return ShowToast({
          color: "success",
          title: "Programação solicitada com sucesso!",
        });
      }

      // Se a resposta não for bem-sucedida, trate o erro
      console.error("Erro ao solicitar a viagem:", response.statusText);
      ShowToast({
        color: "danger",
        title: "Erro ao solicitar a viagem. Tente novamente mais tarde.",
      });
      return null;
    } catch (error) {
      console.error(error);
      ShowToast({
        color: "danger",
        title: "Erro ao solicitar a viagem. Tente novamente mais tarde.",
      });
    }
  }

  async function handleSolicitarViagem() {
    if (validate()) await requestViagem();
  }

  return (
    <>
      <Button variant="faded" onPress={() => onOpen(true)}>
        Programar Viagem
      </Button>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpen}
        motionProps={{
          variants: {
            enter: { opacity: 1, x: 0 },
            exit: { opacity: 0, x: 100 },
          },
        }}
      >
        <ModalContent className="max-w-4xl w-full">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Solicitar Viagem
              </ModalHeader>

              <ModalBody className="max-h-[80vh] overflow-y-auto px-4">
                <section className="mb-6">
                  <SelectCooperativas
                    token={token}
                    setCooperativa={setCooperativa}
                    empresa={empresa}
                  />
                </section>
                <section className="flex flex-col md:flex-row gap-8">
                  {/* Passageiros */}
                  <div className="md:w-1/3 w-full">
                    <h3 className="text-lg font-semibold mb-1">Passageiros</h3>
                    <p className="mb-2 text-sm text-gray-500">
                      Quantidade de passageiros: {passagers.length}
                    </p>
                    <div className="space-y-2">
                      {passagers.map((passager) => (
                        <User
                          key={passager.id}
                          description={passager.phone}
                          name={passager.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Formulário principal */}
                  <div className="md:w-2/3 w-full flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Tipo de Viagem */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">
                          Tipo de Viagem
                        </h3>
                        <TipoViagem setSelectedPlan={setSelectedPlan} />
                      </div>
                      {/* Datas */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">
                          Data da Viagem
                        </h3>
                        <RangeCalendar
                          aria-label="Data da Viagem"
                          value={value}
                          onChange={setValue}
                          isDateUnavailable={(date) =>
                            (evitarFinsDeSemana && isWeekend(date, locale)) ||
                            (evitarDomingos && getDayOfWeek(date, locale) === 0)
                          }
                        />
                        <div className="flex gap-4 mt-2">
                          <Checkbox
                            onChange={() =>
                              setEvitarFinsDeSemana(!evitarFinsDeSemana)
                            }
                            isSelected={evitarFinsDeSemana}
                          >
                            Evitar fins de semana
                          </Checkbox>
                          <Checkbox
                            onChange={() => setEvitarDomingos(!evitarDomingos)}
                            isSelected={evitarDomingos}
                          >
                            Evitar domingos
                          </Checkbox>
                        </div>
                      </div>
                    </div>
                    {/* Horários */}
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Horários</h3>
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <TimeInput
                            variant="underlined"
                            hourCycle={24}
                            isRequired
                            label="Hora da viagem"
                            onChange={setHoraViagem}
                            value={horaViagem}
                          />
                        </div>
                        {selectedPlan === "APANHA_E_RETORNO" && (
                          <div className="flex-1">
                            <TimeInput
                              variant="underlined"
                              hourCycle={24}
                              isRequired
                              label="Hora do retorno"
                              onChange={setHoraRetorno}
                              value={horaRetorno}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              </ModalBody>

              <ModalFooter className="flex justify-end gap-2">
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button color="primary" onPress={handleSolicitarViagem}>
                  Solicitar Viagem
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
