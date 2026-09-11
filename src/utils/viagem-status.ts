import type { Tone } from "@/src/components/ui/superficies";

// Mesma leitura de status na lista e no monitoramento, para os rótulos não divergirem.

const STATUS_TONS: Array<[string[], Tone, string]> = [
  [["ativa", "em andamento", "em percurso", "iniciada", "embarcado"], "success", "solar:routing-2-linear"],
  [["aguardando passageiro", "aguardando", "pendente"], "warning", "solar:hourglass-linear"],
  [["pausada"], "warning", "solar:pause-circle-linear"],
  [["finalizada", "concluida", "concluída"], "accent", "solar:check-circle-linear"],
  [["cancelada"], "danger", "solar:close-circle-linear"],
];

// "AGUARDANDO_PASSAGEIRO" -> "Aguardando passageiro", com tom/ícone por grupo.
export function getStatus(raw?: string): { tone: Tone; icon: string; label: string } {
  const status = (raw ?? "").replace(/_/g, " ").trim().toLowerCase();
  const grupo = STATUS_TONS.find(([valores]) => valores.includes(status));
  return {
    tone: grupo?.[1] ?? "default",
    icon: grupo?.[2] ?? "solar:question-circle-linear",
    label: status ? status.charAt(0).toUpperCase() + status.slice(1) : "Sem status",
  };
}
