"use client";

import { useState } from "react";
import { ActionButton } from "@/src/components/ActionButton";
import FormViagem from "./modal/form-viagem";
import FormViagemProgramada from "./modal/form-viagem-programada";
import { Funcionario } from "@/src/model/funcionario";

interface ViagemActionsProps {
  funcionarios: Funcionario[];
  empresa: string;
  token: string;
}

export default function ViagemActions({
  funcionarios,
  empresa,
  token,
}: ViagemActionsProps) {
  const [isViagemImediataOpen, setIsViagemImediataOpen] = useState(false);
  const [isViagemProgramadaOpen, setIsViagemProgramadaOpen] = useState(false);

  return (
    <>
      {/* Grid de ActionButtons - Foco em Viagens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="min-h-[220px]">
          <div
            onClick={() => setIsViagemImediataOpen(true)}
            className="cursor-pointer"
          >
            <ActionButton
              title="Viagem Imediata"
              description="Solicite uma viagem para agora. Ideal para necessidades urgentes e imprevistas."
              href="#"
              icon="solar:rocket-linear"
              variant="primary"
            />
          </div>
        </div>
        <div className="min-h-[220px]">
          <div
            onClick={() => setIsViagemProgramadaOpen(true)}
            className="cursor-pointer"
          >
            <ActionButton
              title="Programar Viagem"
              description="Agende viagens futuras com antecedência. Planeje e organize com facilidade."
              href="#"
              icon="solar:calendar-add-linear"
              variant="secondary"
            />
          </div>
        </div>
      </div>

      {/* Modal de Viagem Imediata */}
      <FormViagem
        isOpen={isViagemImediataOpen}
        onOpen={setIsViagemImediataOpen}
        passagers={funcionarios}
        empresa={empresa}
        token={token}
      />

      {/* Modal de Viagem Programada */}
      <FormViagemProgramada
        isOpen={isViagemProgramadaOpen}
        onOpen={setIsViagemProgramadaOpen}
        passagers={funcionarios}
        empresa={empresa}
        token={token}
      />
    </>
  );
}
