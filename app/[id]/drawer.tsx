import { Funcionario } from "@/src/model/funcionario";
import { Button } from "@nextui-org/button";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from "@nextui-org/drawer";
import TipoViagem from "./tipoViagem";
import { User } from "@nextui-org/user";
import { useState } from "react";
import { UUID } from "crypto";
interface Props {
  isOpen: boolean;
  onOpen: (open: boolean) => void;
  passagers: Funcionario[];
  empresa: string;
}

export default function App({ isOpen, onOpen, passagers, empresa }: Props) {
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  function validate() {
    const cidade = [] as string[];
    passagers.forEach((passager) => {
      cidade.push(passager.cidade);
    });
    // Verifica se todos os passageiros são da mesma cidade
    // Se não for, exibe um alerta
    // Se for, solicita a viagem
    if (selectedPlan === "") {
      alert("Selecione um plano de viagem!");
      return false;
    }
    if (new Set(cidade).size !== 1) {
      alert("Todos os passageiros devem ser da mesma cidade!");
      return false;
    }
    return true;
  }

  async function handleSolicitarViagem() {
    if (validate()) {
      await requestViagem();
      onOpen(false);
    }
  }

  function generateDataToRequest() {
    const passagersID = [] as UUID[];
    passagers.forEach((passager) => {
      passagersID.push(passager.id);
    });
    const data = {
      empresaID: empresa,
      tipoViagem: selectedPlan,
      cooperativaID: "78e32edc-1a78-4c55-af28-eecf02c67436",
      passageiros: passagersID,
    };

    return data;
  }

  async function requestViagem() {
    const data = generateDataToRequest();
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
  }
  return (
    <>
      <Button onPress={() => onOpen(true)}>Solicitar Viagem</Button>
      <Drawer
        isOpen={isOpen}
        motionProps={{
          variants: {
            enter: {
              opacity: 1,
              x: 0,
            },
            exit: {
              x: 100,
              opacity: 0,
            },
          },
        }}
        onOpenChange={onOpen}
      >
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="flex flex-col gap-1">
                Solicitar Viagem
              </DrawerHeader>
              <DrawerBody>
                <div className="flex flex-col gap-4 items-start p-4 rounded-lg">
                  <h3>Passageiros</h3>
                  <span>Quantidade de passageiros: {passagers.length}</span>
                  <div className="space-y-4 flex flex-col items-start">
                    {passagers.map((passager) => (
                      <User
                        key={passager.id}
                        avatarProps={{
                          src: "https://i.pravatar.cc/150?u=a04258114e29026702d",
                        }}
                        description={passager.phone}
                        name={passager.name}
                      />
                    ))}
                  </div>
                </div>
                <TipoViagem setSelectedPlan={setSelectedPlan} />
              </DrawerBody>
              <DrawerFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancelar Viagem
                </Button>
                <Button color="primary" onPress={handleSolicitarViagem}>
                  Solicitar Viagem
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}
