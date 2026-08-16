export interface FilaAdministrativa {
  id: string;
  nome: string;
  endereco: string;
}

export interface NovaFilaDto {
  nome: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  cep: string;
  estado: string;
}
