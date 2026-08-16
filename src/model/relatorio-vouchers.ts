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

export type StatusVoucher = "PAGO" | "PENDENTE" | "APROVADO" | "CANCELADO";

export interface VoucherCooperativa {
  id: string;
  numeroVoucher: string;
  dataEmissao: string;
  dataVencimento: string;
  nomeEmpresa: string;
  nomeMotorista: string;
  nomePassageiro: string;
  valorTotal: number;
  status: StatusVoucher;
  formaPagamento: string | null;
  origemViagem: string;
  destinoViagem: string;
  observacao: string;
}

export const STATUS_VOUCHER_LABEL: Record<StatusVoucher, string> = {
  PENDENTE: "Aguardando aprovação",
  APROVADO: "Aprovado, aguardando pagamento",
  PAGO: "Pago",
  CANCELADO: "Cancelado",
};

export interface PagarVoucherDto {
  formaPagamento: string;
  referenciaPagamento: string;
}

export interface AplicarDescontoVoucherDto {
  valorDesconto: number;
  motivoDesconto: string;
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