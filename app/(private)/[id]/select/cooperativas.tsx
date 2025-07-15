"use client";

import { ISelect } from "@/src/interface/ISelect";
import { Select, SelectItem } from "@heroui/select";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

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

  useEffect(() => {
    const fetchCooperativas = async () => {
      try {
        const response = await fetch(
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
      }
    };

    fetchCooperativas();
  }, [empresa, token, setCooperativa]);

  const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue(e.target.value);
    setCooperativa(e.target.value);
  };

  return (
    <Select
      variant="underlined"
      className="max-w-xs"
      label="Cooperativa"
      selectedKeys={new Set([value])}
      onChange={handleSelectionChange}
    >
      {cooperativas.map((coop) => (
        <SelectItem key={coop.value}>{coop.label}</SelectItem>
      ))}
    </Select>
  );
}
