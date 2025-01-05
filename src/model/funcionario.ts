import { UUID } from "crypto";

export type Funcionario = {
  id: UUID;
  name: string;
  phone: string;
  cidade: string;
  estado: string;
};
