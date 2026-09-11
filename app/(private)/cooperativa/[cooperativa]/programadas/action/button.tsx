"use client";

import Confirm from "../modal/confirm";
import Motorista from "../select/motorista";
import { useState } from "react";
import ShowToast from "../../../../../../src/components/Toast";
import { assignMotorista } from "./assign-motorista";

interface IMotorista {
  nome: string;
  id: string;
}

interface IProps {
  motoristas: {
    nome: string;
    id: string;
  }[];
  idProgramacao: string;
  token: string;
}

export default function ActionButton({
  motoristas,
  idProgramacao,
  token,
}: IProps) {
  const [selectedMotorista, setSelectedMotorista] = useState<IMotorista | null>(
    null
  );

  // Função para fazer o POST do motorista para a programação usando fetch
  async function atribuirMotorista(idProgramacao: string, idMotorista: string) {
    const result = await assignMotorista({
      idProgramacao,
      idMotorista,
      token,
    });
    if (!result.success) {
      ShowToast({
        color: "danger",
        title: "Erro ao atribuir motorista",
      });
      return null;
    }
    ShowToast({
      color: "success",
      title: "Motorista atribuído com sucesso!",
    });
    return result;
  }

  return (
    <div className="flex flex-row items-center gap-3 w-full">
      <Motorista motoristas={motoristas} setMotorista={setSelectedMotorista} />
      <Confirm
        name={selectedMotorista?.nome || ""}
        isDisabled={!selectedMotorista}
        onCancel={async () => {}}
        onConfirm={async () => {
          if (selectedMotorista && idProgramacao) {
            await atribuirMotorista(idProgramacao, selectedMotorista.id);
          }
        }}
      />
    </div>
  );
}
