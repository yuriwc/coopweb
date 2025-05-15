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

export interface ViagemTempoReal {
  id: string;
  nomePassageiro: string;
  statusViagem: string;
  enderecoOrigem: string;
  enderecoDestino: string;
  latitudeOrigem: number;
  longitudeOrigem: number;
  latitudeDestino: number;
  longitudeDestino: number;
  latitudeMotorista?: number;
  longitudeMotorista?: number;
}
