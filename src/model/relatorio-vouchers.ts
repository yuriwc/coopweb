export interface VoucherDetalhado {
  id: string;
  numeroVoucher: string;
  dataEmissao: string;
  nomeMotorista: string;
  nomePassageiro: string;
  valorTotal: number;
  status: "PAGO" | "PENDENTE" | "APROVADO";
  origemViagem: string;
  destinoViagem: string;
}

export interface DistribuicaoStatus {
  PAGO: number;
  PENDENTE: number;
  APROVADO: number;
}

export interface DistribuicaoValores {
  PAGO: number;
  PENDENTE: number;
  APROVADO: number;
}

export interface CentroCustoVouchers {
  codigoCentroCusto: string;
  descricaoCentroCusto: string;
  totalVouchers: number;
  valorTotal: number;
  valorPago: number;
  valorPendente: number;
  distribuicaoStatus: DistribuicaoStatus;
  distribuicaoValores: DistribuicaoValores;
  vouchers: VoucherDetalhado[];
}

export interface RelatorioVouchersCompleto {
  dataInicio: string;
  dataFim: string;
  empresaNome: string;
  centrosCusto: CentroCustoVouchers[];
  totalVouchersGeral: number;
  valorTotalGeral: number;
  valorPagoGeral: number;
  valorPendenteGeral: number;
  distribuicaoGeralStatus: DistribuicaoStatus;
}

export interface CentroCustoResumo {
  codigoCentroCusto: string;
  descricaoCentroCusto: string;
  totalVouchers: number;
  valorTotal: number;
  valorPago: number;
  valorPendente: number;
}

export interface VoucherCooperativa {
  id: string;
  numeroVoucher: string;
  dataEmissao: string;
  dataVencimento: string;
  nomeEmpresa: string;
  nomeMotorista: string;
  nomePassageiro: string;
  valorTotal: number;
  status: "PAGO" | "PENDENTE" | "APROVADO";
  formaPagamento: string | null;
  origemViagem: string;
  destinoViagem: string;
  observacao: string;
}

export interface RelatorioCooperativaMes {
  cooperativaId: string;
  total: number;
  ano: number;
  empresaId: string | null;
  periodo: {
    inicio: string;
    fim: string;
  };
  mes: number;
  vouchers: VoucherCooperativa[];
}

export interface EmpresaLabelValue {
  label: string;
  value: string;
}