"use client";

import { ISelect } from "@/src/interface/ISelect";
import { Select, Label, ListBox } from "@heroui/react";
import { Spinner } from "@heroui/react/spinner";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { fetchComLog } from "@/src/utils/log-fetch";

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
  const [isLoading, setIsLoading] = useState(true);

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
        const response = await fetchComLog(
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchCentrosCusto();
  }, [empresa, token, setCentroCusto, initialCentroCusto]);

  const handleSelectionChange = (key: string | number | null) => {
    const selected = key?.toString() || "";
    setValue(selected);
    setCentroCusto(selected);
  };

  return (
    <Select
      variant="secondary"
      className="w-full"
      placeholder={
        isLoading
          ? "Carregando..."
          : centrosCusto.length === 0
            ? "Nenhum centro de custo cadastrado"
            : "Selecione"
      }
      isDisabled={isLoading || centrosCusto.length === 0}
      value={value || null}
      onChange={handleSelectionChange}
    >
      <Label>Centro de Custo</Label>
      <Select.Trigger>
        {isLoading && <Spinner size="sm" />}
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {centrosCusto.map((centro) => (
            <ListBox.Item
              key={centro.value.toString()}
              id={centro.value.toString()}
              textValue={centro.label}
            >
              {centro.label}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
