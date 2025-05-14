export interface Viagem {
  passageiros: string[];
  motorista: string;
  dataInicio: string;
  dataFim: string;
  origem: string;
  destino: string;
  status: string;
  preco: number;
}

export interface ViagemResumo {
  viagens: Viagem[];
  totalViagens: number;
  totalValor: number;
}
