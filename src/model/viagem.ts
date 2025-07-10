export interface Viagem {
  passageiros: string[];
  motorista: string;
  solicitante: string;
  dataInicio: string;
  dataFim: string | null;
  origem: string;
  destino: string;
  status: string;
  preco: number;
  horaSolicitacao: string;
  horaProgramacao: string | null;
  horaSaida: string;
  horaChegadaOrigem: string | null;
  horaInicioPercurso: string | null;
  horaChegada: string | null;
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
  // Campos adicionais que podem estar disponíveis no Firebase
  velocidade?: number;
  velocidadeKMH?: number;
  direcao?: number;
  direcaoGraus?: number;
  precisao?: number;
  precisaoMetros?: number;
  timestamp?: number;
  timestampUltimaLocalizacao?: number;
  distanciaPercorrida?: number;
  tempoEstimado?: number;
}
