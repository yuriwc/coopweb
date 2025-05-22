"use client";

import { Select, SelectItem } from "@heroui/select";
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
    <Select
      onSelectionChange={(keys) => {
        const id = Array.from(keys)[0];
        const motorista = motoristas.find((m) => m.id === id);
        console.log(motorista);
        setMotorista(motorista || null);
      }}
      variant="underlined"
      className="max-w-xs"
      items={motoristas}
      label="Motorista"
    >
      {(motorista) => (
        <SelectItem key={motorista.id} textValue={motorista.nome}>
          {motorista.nome}
        </SelectItem>
      )}
    </Select>
  );
}
