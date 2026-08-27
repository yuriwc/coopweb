import { UUID } from "crypto";

export type Funcionario = {
  id: UUID;
  name: string;
  phone: string;
  cidade: string;
  estado: string;
  /** Código de 4 dígitos que o funcionário usa para validar a viagem. */
  codigo?: string | null;
  centroCustoCodigo?: string;
  centroCustoDescricao?: string;
};
