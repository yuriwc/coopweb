"use client";

import { ISelect } from "@/src/interface/ISelect";
import { Select, Label, ListBox } from "@heroui/react";
import { Spinner } from "@heroui/react/spinner";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { fetchComLog } from "@/src/utils/log-fetch";

interface Props {
  empresa: string;
  token: string;
  setCooperativa: Dispatch<SetStateAction<string>>;
}

export default function SelectCooperativas({
  empresa,
  token,
  setCooperativa,
}: Props) {
  const [cooperativas, setCooperativas] = useState<ISelect[]>([]);
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCooperativas = async () => {
      try {
        const response = await fetchComLog(
          `${process.env.NEXT_PUBLIC_SERVER}/api/v1/empresa/${empresa}/cooperativas`,
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
        setCooperativas(data);

        if (data.length === 1) {
          const selected = data[0].value;
          setValue(selected);
          setCooperativa(selected);
        }
      } catch (err) {
        console.error("Erro ao buscar cooperativas:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCooperativas();
  }, [empresa, token, setCooperativa]);

  const handleSelectionChange = (key: string | number | null) => {
    const selected = key?.toString() || "";
    setValue(selected);
    setCooperativa(selected);
  };

  return (
    <Select
      variant="secondary"
      className="w-full"
      placeholder={
        isLoading
          ? "Carregando..."
          : cooperativas.length === 0
            ? "Nenhuma cooperativa disponível"
            : "Selecione"
      }
      isDisabled={isLoading || cooperativas.length === 0}
      value={value || null}
      onChange={handleSelectionChange}
    >
      <Label>Cooperativa</Label>
      <Select.Trigger>
        {isLoading && <Spinner size="sm" />}
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {cooperativas.map((coop) => (
            <ListBox.Item key={coop.value} id={coop.value} textValue={coop.label}>
              {coop.label}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
