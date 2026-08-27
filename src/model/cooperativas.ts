import { UUID } from "crypto";

export type Cooperativa = {
  nome: string;
  id: UUID;
  /** Código de 4 dígitos da cooperativa; é ele que identifica a cooperativa no cadastro de motoristas. */
  codigo?: string | null;
};
