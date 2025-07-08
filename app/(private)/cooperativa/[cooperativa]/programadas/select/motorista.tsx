"use client";

import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
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
    <Autocomplete
      onSelectionChange={(key) => {
        if (key) {
          const motorista = motoristas.find((m) => m.id === key);
          console.log(motorista);
          setMotorista(motorista || null);
        }
      }}
      variant="underlined"
      className="max-w-xs"
      defaultItems={motoristas}
      label="Motorista"
      placeholder="Buscar motorista"
    >
      {(motorista) => (
        <AutocompleteItem key={motorista.id} textValue={motorista.nome}>
          {motorista.nome}
        </AutocompleteItem>
      )}
    </Autocomplete>
  );
}
