import { Funcionario } from "@/src/model/funcionario";
import { Button } from "@heroui/button";
import { Spacer } from "@heroui/spacer";
import TipoViagem from "../tipoViagem";
import { User } from "@heroui/user";
import { useState } from "react";
import { DateValue, RangeCalendar, RangeValue } from "@heroui/calendar";
import { today, getLocalTimeZone, isWeekend } from "@internationalized/date";
import { Checkbox } from "@heroui/checkbox";
import { useLocale } from "@react-aria/i18n";
import { TimeInput, TimeInputValue } from "@heroui/date-input";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";

interface Props {
  isOpen: boolean;
  onOpen: (open: boolean) => void;
  passagers: Funcionario[];
  empresa: string;
}

export default function App({ isOpen, onOpen, passagers, empresa }: Props) {
  const { locale } = useLocale();
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [evitarFinsDeSemana, setEvitarFinsDeSemana] = useState(false);
  const [horaViagem, setHoraViagem] = useState<TimeInputValue | null>(null);
  const [value, setValue] = useState<RangeValue<DateValue> | null>({
    start: today(getLocalTimeZone()),
    end: today(getLocalTimeZone()).add({ weeks: 1 }),
  });

  // Função de validação
  function validate() {
    const cidades = passagers.map((passager) => passager.cidade);

    if (!selectedPlan) {
      alert("Selecione um plano de viagem!");
      return false;
    }

    if (new Set(cidades).size !== 1) {
      alert("Todos os passageiros devem ser da mesma cidade!");
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
      dataInicial: value?.start,
      dataFinal: value?.end,
      horaViagem,
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

  return (
    <>
      <Button variant="light" onPress={() => onOpen(true)}>
        Solicitar Viagem
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
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Solicitar Viagem
              </ModalHeader>

              <ModalBody className="h-[80vh] overflow-y-auto">
                <section className="flex flex-col gap-4">
                  <h3>Passageiros</h3>
                  <p>Quantidade de passageiros: {passagers.length}</p>

                  <div className="space-y-4">
                    {passagers.map((passager) => (
                      <User
                        key={passager.id}
                        avatarProps={{
                          src: "https://i.pravatar.cc/150?u=" + passager.id,
                        }}
                        description={passager.phone}
                        name={passager.name}
                      />
                    ))}
                  </div>
                </section>

                <TipoViagem setSelectedPlan={setSelectedPlan} />

                <Spacer />

                <TimeInput
                  hourCycle={24}
                  isRequired
                  label="Hora da viagem"
                  onChange={setHoraViagem}
                  value={horaViagem}
                />

                <RangeCalendar
                  aria-label="Data da Viagem"
                  value={value}
                  onChange={setValue}
                  isDateUnavailable={(date) =>
                    evitarFinsDeSemana && isWeekend(date, locale)
                  }
                />

                <Checkbox
                  onChange={() => setEvitarFinsDeSemana(!evitarFinsDeSemana)}
                >
                  Evitar fins de semana
                </Checkbox>
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
