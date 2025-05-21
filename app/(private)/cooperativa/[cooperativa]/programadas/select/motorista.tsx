"use client";

import { Select, SelectItem } from "@heroui/select";

interface Props {
  motoristas: IResponse[];
}

interface IResponse {
  nome: string;
  id: string;
}

export default function App({ motoristas }: Props) {
  return (
    <Select
      variant="bordered"
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
