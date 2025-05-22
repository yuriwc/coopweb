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

export interface Passageiro {
  nome?: string;
  sobrenome?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  latitude?: number;
  longitude?: number;
}

export interface ViagemRealTime {
  id: string;
  motoristaId: string;
  passageiros: Passageiro[];
  statusViagem: string;
  enderecoEmpresa: string;
  latitudeOrigem: number;
  longitudeOrigem: number;
  latitudeDestino: number;
  longitudeDestino: number;
  latitudeMotorista?: number;
  longitudeMotorista?: number;
}
