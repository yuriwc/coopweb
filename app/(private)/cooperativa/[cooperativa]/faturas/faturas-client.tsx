"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Chip, ComboBox, Input, Label, ListBox, cn } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Spinner } from "@heroui/react/spinner";
import { Modal, useOverlayState } from "@heroui/react";
import {
  RelatorioCooperativaMes,
  StatusVoucher,
  VoucherCooperativa,
  EmpresaLabelValue,
} from "../../../../../src/model/relatorio-vouchers";
import ShowToast from "../../../../../src/components/Toast";
import VouchersCooperativaTable from "./vouchers-cooperativa-table";
import { aprovarVoucher } from "./action/aprovar-voucher";
import { cancelarVoucher } from "./action/cancelar-voucher";
import ConfirmarAcaoModal from "./modal/confirmar-acao-modal";
import ConfirmarPagamentoModal from "./modal/confirmar-pagamento-modal";
import AplicarDescontoModal from "./modal/aplicar-desconto-modal";
import { Bezel, EASE, Rotulo, TONE, rise, type Tone } from "@/src/components/ui/superficies";

interface LabelValue {
  value: string;
  label: string;
}

interface FaturasClientProps {
  cooperativaId: string;
  relatorioInicial: RelatorioCooperativaMes | null;
  empresasDisponiveis: EmpresaLabelValue[];
  errorInicial: string | null;
  token: string;
}

const MESES = [
  { value: "1", label: "Janeiro" },
  { value: "2", label: "Fevereiro" },
  { value: "3", label: "Março" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Maio" },
  { value: "6", label: "Junho" },
  { value: "7", label: "Julho" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

const ANOS = Array.from({ length: 5 }, (_, i) => {
  const ano = new Date().getFullYear() - i;
  return { value: ano.toString(), label: ano.toString() };
});

// Os cartões de resumo também são o filtro de status: clicar filtra a tabela.
const CARTOES: Array<{
  valor: "TODOS" | StatusVoucher;
  titulo: string;
  icone: string;
  tom: Tone;
}> = [
  { valor: "TODOS", titulo: "Total do período", icone: "solar:bill-list-linear", tom: "accent" },
  { valor: "PENDENTE", titulo: "Aguardando aprovação", icone: "solar:clock-circle-linear", tom: "warning" },
  { valor: "APROVADO", titulo: "Aguardando pagamento", icone: "solar:check-circle-linear", tom: "accent" },
  { valor: "PAGO", titulo: "Pagos", icone: "solar:shield-check-linear", tom: "success" },
  { valor: "CANCELADO", titulo: "Cancelados", icone: "solar:close-circle-linear", tom: "danger" },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

function FiltroCombo({
  rotulo,
  itens,
  valor,
  onChange,
  placeholder,
}: {
  rotulo: string;
  itens: LabelValue[];
  valor: string;
  onChange: (valor: string) => void;
  placeholder: string;
}) {
  return (
    <ComboBox
      selectedKey={valor}
      onSelectionChange={(key) => {
        if (key) onChange(key as string);
      }}
      defaultItems={itens}
      className="w-full"
    >
      <Label>{rotulo}</Label>
      <ComboBox.InputGroup>
        <Input placeholder={placeholder} />
        <ComboBox.Trigger />
      </ComboBox.InputGroup>
      <ComboBox.Popover>
        <ListBox>
          {(item: LabelValue) => (
            <ListBox.Item id={item.value} textValue={item.label}>
              {item.label}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          )}
        </ListBox>
      </ComboBox.Popover>
    </ComboBox>
  );
}

export default function FaturasClient({
  cooperativaId,
  relatorioInicial,
  empresasDisponiveis,
  errorInicial,
  token,
}: FaturasClientProps) {
  const router = useRouter();
  const [relatorio, setRelatorio] = useState<RelatorioCooperativaMes | null>(relatorioInicial);
  const [error, setError] = useState<string | null>(errorInicial);
  const [loading, setLoading] = useState(false);
  const [baixandoPdf, setBaixandoPdf] = useState(false);

  const [mesAtual] = useState(() => new Date().getMonth() + 1);
  const [anoAtual] = useState(() => new Date().getFullYear());
  const [mesSelecionado, setMesSelecionado] = useState<string>(mesAtual.toString());
  const [anoSelecionado, setAnoSelecionado] = useState<string>(anoAtual.toString());
  const [empresaSelecionada, setEmpresaSelecionada] = useState<string>("TODAS");
  const [statusFiltro, setStatusFiltro] = useState<"TODOS" | StatusVoucher>("TODOS");

  const { isOpen, open, close } = useOverlayState();
  const [mesRelatorio, setMesRelatorio] = useState<string>(mesAtual.toString());
  const [anoRelatorio, setAnoRelatorio] = useState<string>(anoAtual.toString());
  const [loadingRelatorio, setLoadingRelatorio] = useState(false);

  const [vouchersProcessando, setVouchersProcessando] = useState<Set<string>>(new Set());
  const [voucherParaAprovar, setVoucherParaAprovar] = useState<VoucherCooperativa | null>(null);
  const [voucherParaCancelar, setVoucherParaCancelar] = useState<VoucherCooperativa | null>(null);
  const [voucherParaPagar, setVoucherParaPagar] = useState<VoucherCooperativa | null>(null);
  const [voucherParaDesconto, setVoucherParaDesconto] = useState<VoucherCooperativa | null>(null);

  const buscarDados = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append("mes", mesSelecionado);
      params.append("ano", anoSelecionado);

      if (empresaSelecionada !== "TODAS") {
        params.append("empresaId", empresaSelecionada);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER}/api/v1/voucher/cooperativa/${cooperativaId}/mes?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setRelatorio(await response.json());
      } else {
        setError(`Erro ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error("Erro ao buscar faturas:", err);
      setError("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  }, [cooperativaId, mesSelecionado, anoSelecionado, empresaSelecionada, token]);

  // Mudou mês, ano ou empresa: busca sozinho. Antes era preciso lembrar de
  // clicar em "Atualizar", enquanto o status filtrava na hora — dois
  // comportamentos diferentes para filtros que parecem iguais.
  const primeiraRenderizacao = useRef(true);
  useEffect(() => {
    if (primeiraRenderizacao.current) {
      primeiraRenderizacao.current = false;
      return;
    }
    buscarDados();
  }, [buscarDados]);

  function marcarProcessando(voucherId: string, processando: boolean) {
    setVouchersProcessando((prev) => {
      const next = new Set(prev);
      if (processando) next.add(voucherId);
      else next.delete(voucherId);
      return next;
    });
  }

  function handleAbrirAprovar(voucher: VoucherCooperativa) {
    marcarProcessando(voucher.id, true);
    setVoucherParaAprovar(voucher);
  }

  function handleFecharAprovar() {
    if (voucherParaAprovar) marcarProcessando(voucherParaAprovar.id, false);
    setVoucherParaAprovar(null);
  }

  async function handleAprovarSucesso() {
    const voucherId = voucherParaAprovar?.id;
    setVoucherParaAprovar(null);
    ShowToast({ color: "success", title: "Voucher aprovado" });
    await buscarDados();
    if (voucherId) marcarProcessando(voucherId, false);
  }

  function handleAbrirCancelar(voucher: VoucherCooperativa) {
    marcarProcessando(voucher.id, true);
    setVoucherParaCancelar(voucher);
  }

  function handleFecharCancelar() {
    if (voucherParaCancelar) marcarProcessando(voucherParaCancelar.id, false);
    setVoucherParaCancelar(null);
  }

  async function handleCancelarSucesso() {
    const voucherId = voucherParaCancelar?.id;
    setVoucherParaCancelar(null);
    ShowToast({ color: "success", title: "Voucher cancelado" });
    await buscarDados();
    if (voucherId) marcarProcessando(voucherId, false);
  }

  function handleAbrirPagamento(voucher: VoucherCooperativa) {
    marcarProcessando(voucher.id, true);
    setVoucherParaPagar(voucher);
  }

  function handleFecharPagamento() {
    if (voucherParaPagar) marcarProcessando(voucherParaPagar.id, false);
    setVoucherParaPagar(null);
  }

  async function handlePagamentoSucesso() {
    const voucherId = voucherParaPagar?.id;
    setVoucherParaPagar(null);
    ShowToast({ color: "success", title: "Pagamento registrado com sucesso" });
    await buscarDados();
    if (voucherId) marcarProcessando(voucherId, false);
  }

  function handleAbrirDesconto(voucher: VoucherCooperativa) {
    marcarProcessando(voucher.id, true);
    setVoucherParaDesconto(voucher);
  }

  function handleFecharDesconto() {
    if (voucherParaDesconto) marcarProcessando(voucherParaDesconto.id, false);
    setVoucherParaDesconto(null);
  }

  async function handleDescontoSucesso() {
    const voucherId = voucherParaDesconto?.id;
    setVoucherParaDesconto(null);
    ShowToast({ color: "success", title: "Desconto aplicado com sucesso" });
    await buscarDados();
    if (voucherId) marcarProcessando(voucherId, false);
  }

  const baixarArquivo = async (url: string, nomeArquivo: string) => {
    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });

    if (!response.ok) {
      throw new Error(`Erro ${response.status}`);
    }

    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(objectUrl);
    document.body.removeChild(link);
  };

  const gerarPDF = async () => {
    setBaixandoPdf(true);
    try {
      const params = new URLSearchParams();
      params.append("mes", mesSelecionado);
      params.append("ano", anoSelecionado);
      if (empresaSelecionada !== "TODAS") {
        params.append("empresaId", empresaSelecionada);
      }

      await baixarArquivo(
        `${process.env.NEXT_PUBLIC_SERVER}/api/v1/voucher/cooperativa/${cooperativaId}/mes/pdf?${params.toString()}`,
        `vouchers_${MESES.find((m) => m.value === mesSelecionado)?.label}_${anoSelecionado}.pdf`
      );
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      ShowToast({ color: "danger", title: "Não foi possível gerar o PDF" });
    } finally {
      setBaixandoPdf(false);
    }
  };

  const gerarRelatorioMensal = async () => {
    setLoadingRelatorio(true);
    try {
      await baixarArquivo(
        `${process.env.NEXT_PUBLIC_SERVER}/api/v1/relatorio/cooperativa/${cooperativaId}/motoristas/pdf?mes=${mesRelatorio}&ano=${anoRelatorio}`,
        `relatorio_mensal_${MESES.find((m) => m.value === mesRelatorio)?.label}_${anoRelatorio}.pdf`
      );
      close();
    } catch (err) {
      console.error("Erro ao gerar relatório:", err);
      ShowToast({ color: "danger", title: "Não foi possível gerar o relatório" });
    } finally {
      setLoadingRelatorio(false);
    }
  };

  const resumo = useMemo(() => {
    const vazio = { total: { quantidade: 0, valor: 0 } } as Record<
      string,
      { quantidade: number; valor: number }
    >;

    const acumulado = (relatorio?.vouchers ?? []).reduce((acc, voucher) => {
      const atual = acc[voucher.status] ?? { quantidade: 0, valor: 0 };
      acc[voucher.status] = {
        quantidade: atual.quantidade + 1,
        valor: atual.valor + voucher.valorTotal,
      };
      acc.total = {
        quantidade: acc.total.quantidade + 1,
        valor: acc.total.valor + voucher.valorTotal,
      };
      return acc;
    }, vazio);

    return acumulado;
  }, [relatorio]);

  const vouchersFiltrados = useMemo(
    () =>
      (relatorio?.vouchers ?? []).filter((voucher) =>
        statusFiltro === "TODOS" ? true : voucher.status === statusFiltro
      ),
    [relatorio, statusFiltro]
  );

  const opcoesEmpresas = [{ value: "TODAS", label: "Todas as empresas" }, ...empresasDisponiveis];
  const nomeMes = MESES.find((m) => m.value === mesSelecionado)?.label ?? "";

  return (
    <div className="min-h-[calc(100dvh-4rem)]">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 motion-safe:animate-rise sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              isIconOnly
              variant="tertiary"
              aria-label="Voltar"
              className="shrink-0 rounded-full"
              onPress={() => router.back()}
            >
              <Icon icon="solar:arrow-left-linear" className="size-4" />
            </Button>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold tracking-tight text-foreground">
                Faturas da cooperativa
              </h1>
              <p className="mt-0.5 text-sm text-muted">
                {nomeMes} de {anoSelecionado}
                {relatorio ? ` · ${relatorio.total} vouchers` : ""}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button variant="tertiary" size="sm" className="rounded-full" onPress={open}>
              <Icon icon="solar:chart-square-linear" className="size-4" />
              Relatório mensal
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full"
              onPress={gerarPDF}
              isPending={baixandoPdf}
              isDisabled={!relatorio}
            >
              {!baixandoPdf && <Icon icon="solar:download-linear" className="size-4" />}
              Baixar PDF
            </Button>
          </div>
        </header>

        {/* Filtros do servidor: mudar qualquer um recarrega os dados. */}
        <Bezel
          className="mt-5 motion-safe:animate-rise"
          style={rise(60)}
          coreClassName="flex flex-col gap-4 p-4 sm:flex-row sm:items-end"
        >
          <div className="grid flex-1 gap-4 sm:grid-cols-3">
            <FiltroCombo
              rotulo="Mês"
              itens={MESES}
              valor={mesSelecionado}
              onChange={setMesSelecionado}
              placeholder="Buscar mês"
            />
            <FiltroCombo
              rotulo="Ano"
              itens={ANOS}
              valor={anoSelecionado}
              onChange={setAnoSelecionado}
              placeholder="Buscar ano"
            />
            <FiltroCombo
              rotulo="Empresa"
              itens={opcoesEmpresas}
              valor={empresaSelecionada}
              onChange={setEmpresaSelecionada}
              placeholder="Buscar empresa"
            />
          </div>

          <Button
            isIconOnly
            variant="tertiary"
            className="shrink-0 rounded-full"
            aria-label="Recarregar faturas"
            onPress={() => buscarDados()}
            isPending={loading}
          >
            {!loading && <Icon icon="solar:refresh-linear" className="size-4" />}
          </Button>
        </Bezel>

        {/* Resumo que também filtra */}
        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-5">
          {CARTOES.map((cartao, indice) => {
            const dados =
              cartao.valor === "TODOS"
                ? resumo.total
                : resumo[cartao.valor] ?? { quantidade: 0, valor: 0 };
            const ativo = statusFiltro === cartao.valor;

            return (
              <button
                key={cartao.valor}
                type="button"
                aria-pressed={ativo}
                onClick={() => setStatusFiltro(cartao.valor)}
                className="group rounded-[1.75rem] text-left motion-safe:animate-rise focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                style={rise(100 + indice * 40)}
              >
                <Bezel
                  className={cn(ativo && "ring-2 ring-accent")}
                  coreClassName={cn(
                    "flex h-full flex-col justify-between gap-3 p-4 transition-transform duration-500 group-hover:-translate-y-0.5",
                    EASE
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <Rotulo className="truncate">{cartao.titulo}</Rotulo>
                    <span
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-lg",
                        TONE[cartao.tom].soft,
                        TONE[cartao.tom].text
                      )}
                    >
                      <Icon icon={cartao.icone} className="size-4" />
                    </span>
                  </div>
                  <div>
                    <p className="text-lg font-semibold leading-none tracking-tight tabular-nums text-foreground">
                      {formatCurrency(dados.valor)}
                    </p>
                    <p className={cn("mt-1.5 text-xs font-medium", TONE[cartao.tom].text)}>
                      {dados.quantidade} voucher{dados.quantidade === 1 ? "" : "s"}
                    </p>
                  </div>
                </Bezel>
              </button>
            );
          })}
        </div>

        {/* Lista */}
        <Bezel className="mt-4 motion-safe:animate-rise" style={rise(320)} coreClassName="p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-foreground">Vouchers</h2>
            {statusFiltro !== "TODOS" && (
              <Chip size="sm" variant="tertiary" color="accent">
                {CARTOES.find((c) => c.valor === statusFiltro)?.titulo}
                <button
                  type="button"
                  aria-label="Limpar filtro de status"
                  className="opacity-70 transition-opacity hover:opacity-100"
                  onClick={() => setStatusFiltro("TODOS")}
                >
                  <Icon icon="solar:close-circle-linear" className="size-3.5" />
                </button>
              </Chip>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner size="lg" color="accent" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-danger-soft text-danger">
                <Icon icon="solar:danger-circle-linear" className="size-7" />
              </span>
              <div>
                <p className="font-semibold text-foreground">Erro ao carregar as faturas</p>
                <p className="mt-1 text-sm text-muted">{error}</p>
              </div>
              <Button variant="tertiary" className="rounded-full" onPress={() => buscarDados()}>
                <Icon icon="solar:refresh-linear" className="size-4" />
                Tentar novamente
              </Button>
            </div>
          ) : (
            <VouchersCooperativaTable
              vouchers={vouchersFiltrados}
              vouchersProcessando={vouchersProcessando}
              onAprovar={handleAbrirAprovar}
              onAbrirPagamento={handleAbrirPagamento}
              onAbrirDesconto={handleAbrirDesconto}
              onCancelar={handleAbrirCancelar}
            />
          )}
        </Bezel>
      </div>

      {/* Relatório mensal */}
      <Modal>
        <Modal.Backdrop
          isOpen={isOpen}
          onOpenChange={(aberto) => {
            if (!aberto) close();
          }}
        >
          <Modal.Container placement="center">
            <Modal.Dialog className="w-full max-w-lg">
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>
                  Relatório mensal
                  <p className="text-sm font-normal text-muted">
                    Total gerado por motorista, somando todas as empresas
                  </p>
                </Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FiltroCombo
                    rotulo="Mês"
                    itens={MESES}
                    valor={mesRelatorio}
                    onChange={setMesRelatorio}
                    placeholder="Buscar mês"
                  />
                  <FiltroCombo
                    rotulo="Ano"
                    itens={ANOS}
                    valor={anoRelatorio}
                    onChange={setAnoRelatorio}
                    placeholder="Buscar ano"
                  />
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="tertiary" onPress={close} isDisabled={loadingRelatorio}>
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onPress={gerarRelatorioMensal}
                  isPending={loadingRelatorio}
                >
                  {!loadingRelatorio && <Icon icon="solar:download-linear" className="size-4" />}
                  Baixar relatório
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      <ConfirmarAcaoModal
        isOpen={voucherParaAprovar !== null}
        onOpenChange={(open) => !open && handleFecharAprovar()}
        titulo={`Aprovar voucher ${voucherParaAprovar?.numeroVoucher ?? ""}`}
        descricao='O voucher passa para "Aprovado, aguardando pagamento".'
        rotuloConfirmar="Aprovar"
        corConfirmar="primary"
        onConfirmar={async () => {
          if (!voucherParaAprovar) return { success: false, message: "Voucher inválido" };
          return aprovarVoucher({ voucherId: voucherParaAprovar.id, token });
        }}
        onSucesso={handleAprovarSucesso}
      />

      <ConfirmarAcaoModal
        isOpen={voucherParaCancelar !== null}
        onOpenChange={(open) => !open && handleFecharCancelar()}
        titulo={`Cancelar voucher ${voucherParaCancelar?.numeroVoucher ?? ""}`}
        descricao="O voucher passa para “Cancelado” e não poderá mais ser aprovado ou pago."
        rotuloConfirmar="Cancelar voucher"
        corConfirmar="danger"
        onConfirmar={async () => {
          if (!voucherParaCancelar) return { success: false, message: "Voucher inválido" };
          return cancelarVoucher({ voucherId: voucherParaCancelar.id, token });
        }}
        onSucesso={handleCancelarSucesso}
      />

      <ConfirmarPagamentoModal
        isOpen={voucherParaPagar !== null}
        onOpenChange={(open) => !open && handleFecharPagamento()}
        voucher={voucherParaPagar}
        token={token}
        onSucesso={handlePagamentoSucesso}
      />

      <AplicarDescontoModal
        isOpen={voucherParaDesconto !== null}
        onOpenChange={(open) => !open && handleFecharDesconto()}
        voucher={voucherParaDesconto}
        token={token}
        onSucesso={handleDescontoSucesso}
      />
    </div>
  );
}
