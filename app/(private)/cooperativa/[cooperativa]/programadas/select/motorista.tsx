"use client";

import { ComboBox, Input, ListBox, Label } from "@heroui/react";
import { Dispatch, SetStateAction } from "react";

interface IMotorista {
  nome: string;
  id: string;
}

interface Props {
  motoristas: IResponse[];
  setMotorista: Dispatch<SetStateAction<IMotorista | null>>;
}

interface IResponse {
  nome: string;
  id: string;
}

export default function App({ motoristas, setMotorista }: Props) {
  return (
    <ComboBox
      onSelectionChange={(key) => {
        if (key) {
          const motorista = motoristas.find((m) => m.id === key);
          setMotorista(motorista || null);
        }
      }}
      variant="secondary"
      className="max-w-xs"
    >
      <Label>Motorista</Label>
      <ComboBox.InputGroup>
        <Input placeholder="Buscar motorista" />
        <ComboBox.Trigger />
      </ComboBox.InputGroup>
      <ComboBox.Popover>
        <ListBox>
          {motoristas.map((motorista) => (
            <ListBox.Item key={motorista.id} id={motorista.id} textValue={motorista.nome}>
              {motorista.nome}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </ComboBox.Popover>
    </ComboBox>
  );
}
