"use client";

import { ISelect } from "@/src/interface/ISelect";
import { Select, SelectItem } from "@heroui/select";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

interface Props {
  empresa: string;
  token: string;
  setCentroCusto: Dispatch<SetStateAction<string>>;
}

export default function SelectCentrosCusto({
  empresa,
  token,
  setCentroCusto,
}: Props) {
  const [centrosCusto, setCentrosCusto] = useState<ISelect[]>([]);
  const [value, setValue] = useState("");

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
        console.log("Centros de custo:", data);
        setCentrosCusto(data);

        if (data.length === 1) {
          const selected = data[0].value;
          setValue(selected);
          setCentroCusto(selected);
        }
      } catch (err) {
        console.error("Erro ao buscar centros de custo:", err);
      }
    };

    fetchCentrosCusto();
  }, [empresa, token, setCentroCusto]);

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
        <SelectItem key={centro.value}>{centro.label}</SelectItem>
      ))}
    </Select>
  );
}
