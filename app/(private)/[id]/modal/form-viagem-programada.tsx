import { Funcionario } from "@/src/model/funcionario";
import { Button } from "@heroui/button";
import TipoViagem from "../tipoViagem";
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
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Icon } from "@iconify/react";
import { Avatar } from "@heroui/avatar";
import { Badge } from "@heroui/badge";
import ShowToast from "@/src/components/Toast";

interface Props {
  isOpen: boolean;
  onOpen: (open: boolean) => void;
  passagers: Funcionario[];
  empresa: string;
  token: string;
}

export default function ScheduledTripModal({
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
  const [isLoading, setIsLoading] = useState(false);
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

    if (!horaViagem) {
      ShowToast({
        color: "danger",
        title: selectedPlan === "RETORNO" 
          ? "Informe a hora do retorno!" 
          : "Informe a hora da viagem!",
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
      horaRetorno: selectedPlan === "APANHA_E_RETORNO" ? horaRetorno : undefined,
    };
  }

  // Função para realizar a solicitação da viagem
  async function requestViagem() {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSolicitarViagem() {
    if (validate()) {
      await requestViagem();
    }
  }

  return (
    <>
      <Button
        variant="flat"
        color="secondary"
        onPress={() => onOpen(true)}
        startContent={<Icon icon="solar:calendar-linear" className="w-4 h-4" />}
        className="backdrop-blur-sm bg-purple-500/10 hover:bg-purple-500/20 border border-purple-200/30 dark:border-purple-800/30 text-purple-700 dark:text-purple-300 font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/25"
      >
        Programar Viagem
      </Button>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpen}
        size="5xl"
        scrollBehavior="inside"
        classNames={{
          backdrop:
            "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
          wrapper: "items-center justify-center",
          base: "max-h-[90vh] my-6",
          body: "p-0",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 py-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Icon
                      icon="solar:calendar-date-linear"
                      className="w-4 h-4 text-purple-600 dark:text-purple-400"
                    />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Programar Viagem
                    </h3>
                    <p className="text-xs text-foreground-600">
                      Configure uma viagem programada
                    </p>
                  </div>
                </div>
              </ModalHeader>

              <ModalBody className="px-6 py-4 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
                {/* Seção: Cooperativa */}
                <Card className="border border-default-200 min-h-[160px] flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                        <Icon
                          icon="solar:buildings-3-linear"
                          className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                        />
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-foreground">
                          Cooperativa
                        </h4>
                        <p className="text-sm text-foreground-600">
                          Selecione a cooperativa responsável
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardBody className="pt-0 pb-3 flex-1 flex items-center">
                    <div className="w-full">
                      <SelectCooperativas
                        setCooperativa={setCooperativa}
                        empresa={empresa}
                        token={token}
                      />
                    </div>
                  </CardBody>
                </Card>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {/* Seção: Passageiros */}
                  <Card className="border border-default-200 min-h-[320px] flex flex-col">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2 w-full justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                            <Icon
                              icon="solar:users-group-two-rounded-linear"
                              className="w-4 h-4 text-violet-600 dark:text-violet-400"
                            />
                          </div>
                          <div>
                            <h4 className="text-base font-semibold text-foreground">
                              Passageiros
                            </h4>
                            <p className="text-sm text-foreground-600">
                              Lista de colaboradores
                            </p>
                          </div>
                        </div>
                        <Badge
                          content={passagers.length}
                          color="primary"
                          shape="circle"
                        >
                          <Chip variant="flat" color="primary" size="sm">
                            {passagers.length} selecionado
                            {passagers.length !== 1 ? "s" : ""}
                          </Chip>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardBody className="pt-0 pb-3 flex-1">
                      <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                        {passagers.map((passager, index) => (
                          <div
                            key={passager.id}
                            className="flex items-center gap-3 p-3 bg-default-50 dark:bg-default-100/50 rounded-lg border border-default-200"
                          >
                            <Avatar
                              size="sm"
                              name={passager.name?.charAt(0).toUpperCase()}
                              classNames={{
                                base: "bg-gradient-to-r from-violet-600 to-blue-600",
                                name: "text-white font-semibold",
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">
                                {passager.name}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Icon
                                  icon="solar:phone-linear"
                                  className="w-3 h-3 text-default-400 flex-shrink-0"
                                />
                                <p className="text-xs text-foreground-600 truncate">
                                  {passager.phone}
                                </p>
                              </div>
                            </div>
                            <Chip variant="flat" size="sm" color="secondary">
                              #{index + 1}
                            </Chip>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>

                  {/* Seção: Tipo de Viagem */}
                  <Card className="border border-default-200 min-h-[320px] flex flex-col">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                          <Icon
                            icon="solar:route-linear"
                            className="w-4 h-4 text-amber-600 dark:text-amber-400"
                          />
                        </div>
                        <div>
                          <h4 className="text-base font-semibold text-foreground">
                            Tipo de Viagem
                          </h4>
                          <p className="text-sm text-foreground-600">
                            Escolha o tipo de serviço
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardBody className="pt-0 pb-3 flex-1 flex items-center">
                      <div className="w-full">
                        <TipoViagem setSelectedPlan={setSelectedPlan} />
                      </div>
                    </CardBody>
                  </Card>
                </div>

                {/* Seção: Período da Viagem */}
                <Card className="border border-default-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Icon
                          icon="solar:calendar-mark-linear"
                          className="w-4 h-4 text-blue-600 dark:text-blue-400"
                        />
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-foreground">
                          Período da Viagem
                        </h4>
                        <p className="text-sm text-foreground-600">
                          Selecione as datas e configure restrições
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardBody className="pt-0 pb-3">
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex-1">
                        <RangeCalendar
                          aria-label="Data da Viagem"
                          value={value}
                          onChange={setValue}
                          classNames={{
                            content: "w-full",
                            base: "w-full",
                          }}
                          isDateUnavailable={(date) =>
                            (evitarFinsDeSemana && isWeekend(date, locale)) ||
                            (evitarDomingos && getDayOfWeek(date, locale) === 0)
                          }
                        />
                      </div>
                      <div className="lg:w-64">
                        <h5 className="text-sm font-semibold text-foreground mb-3">
                          Restrições de Data
                        </h5>
                        <div className="space-y-3">
                          <Checkbox
                            onChange={() =>
                              setEvitarFinsDeSemana(!evitarFinsDeSemana)
                            }
                            isSelected={evitarFinsDeSemana}
                            size="sm"
                          >
                            <span className="text-sm">
                              Evitar fins de semana
                            </span>
                          </Checkbox>
                          <Checkbox
                            onChange={() => setEvitarDomingos(!evitarDomingos)}
                            isSelected={evitarDomingos}
                            size="sm"
                          >
                            <span className="text-sm">Evitar domingos</span>
                          </Checkbox>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Seção: Horários */}
                <Card className="border border-default-200 min-h-[160px] flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                        <Icon
                          icon="solar:clock-circle-linear"
                          className="w-4 h-4 text-cyan-600 dark:text-cyan-400"
                        />
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-foreground">
                          Horários
                        </h4>
                        <p className="text-sm text-foreground-600">
                          Configure os horários da viagem
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardBody className="pt-0 pb-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Campo sempre visível - muda o label baseado no tipo */}
                      <TimeInput
                        variant="bordered"
                        hourCycle={24}
                        isRequired
                        label={
                          selectedPlan === "RETORNO" 
                            ? "Hora do retorno" 
                            : selectedPlan === "APANHA_E_RETORNO"
                            ? "Hora da apanha"
                            : "Hora da viagem"
                        }
                        onChange={setHoraViagem}
                        value={horaViagem}
                        startContent={
                          <Icon
                            icon="solar:clock-linear"
                            className="w-4 h-4 text-default-400"
                          />
                        }
                      />
                      {/* Campo do retorno - só aparece em APANHA_E_RETORNO */}
                      {selectedPlan === "APANHA_E_RETORNO" && (
                        <TimeInput
                          variant="bordered"
                          hourCycle={24}
                          isRequired
                          label="Hora do retorno"
                          onChange={setHoraRetorno}
                          value={horaRetorno}
                          startContent={
                            <Icon
                              icon="solar:clock-linear"
                              className="w-4 h-4 text-default-400"
                            />
                          }
                        />
                      )}
                    </div>
                  </CardBody>
                </Card>
              </ModalBody>

              <ModalFooter className="bg-default-50 dark:bg-default-100/50 py-3 px-6">
                <Button
                  variant="light"
                  onPress={onClose}
                  startContent={
                    <Icon
                      icon="solar:close-circle-linear"
                      className="w-4 h-4"
                    />
                  }
                >
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onPress={handleSolicitarViagem}
                  isLoading={isLoading}
                  startContent={
                    !isLoading ? (
                      <Icon
                        icon="solar:calendar-add-linear"
                        className="w-4 h-4"
                      />
                    ) : null
                  }
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold"
                >
                  {isLoading ? "Programando..." : "Programar Viagem"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
