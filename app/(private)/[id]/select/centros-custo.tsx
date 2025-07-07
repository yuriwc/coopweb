"use client";

import { ISelect } from "@/src/interface/ISelect";
import { Select, SelectItem } from "@heroui/select";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

interface Props {
  empresa: string;
  token: string;
  setCentroCusto: Dispatch<SetStateAction<string>>;
  initialCentroCusto?: string;
}

export default function SelectCentrosCusto({
  empresa,
  token,
  setCentroCusto,
  initialCentroCusto,
}: Props) {
  const [centrosCusto, setCentrosCusto] = useState<ISelect[]>([]);
  const [value, setValue] = useState(initialCentroCusto || "");

  // Atualiza o valor quando initialCentroCusto muda
  useEffect(() => {
    if (initialCentroCusto && initialCentroCusto !== value) {
      setValue(initialCentroCusto);
      setCentroCusto(initialCentroCusto);
    }
  }, [initialCentroCusto, setCentroCusto, value]);

  useEffect(() => {
    const fetchCentrosCusto = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER}/api/v1/centro-custo/labels`,
          {
            next: { tags: ["getViagens"] },
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          console.error(
            "Erro na requisição:",
            response.status,
            response.statusText
          );
          return;
        }

        const data: ISelect[] = await response.json();
        setCentrosCusto(data);

        // Auto-selecionar se houver apenas um centro de custo e não há valor inicial
        if (!initialCentroCusto && data.length === 1) {
          const selected = data[0].value.toString();
          setValue(selected);
          setCentroCusto(selected);
        }
      } catch (err) {
        console.error("Erro ao buscar centros de custo:", err);
      }
    };

    fetchCentrosCusto();
  }, [empresa, token, setCentroCusto, initialCentroCusto]);

  const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue(e.target.value);
    setCentroCusto(e.target.value);
  };

  return (
    <Select
      variant="underlined"
      className="max-w-xs"
      label="Centro de Custo"
      selectedKeys={[value]}
      onChange={handleSelectionChange}
    >
      {centrosCusto.map((centro) => (
        <SelectItem key={centro.value.toString()}>{centro.label}</SelectItem>
      ))}
    </Select>
  );
}
