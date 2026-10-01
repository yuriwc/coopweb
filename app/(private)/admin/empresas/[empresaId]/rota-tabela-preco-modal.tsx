"use client";

import { useState } from "react";
import {
  Alert,
  Button,
  FieldError,
  Fieldset,
  Form,
  Input,
  InputGroup,
  Label,
  Modal,
  TextArea,
  TextField,
} from "@heroui/react";
import {
  CampoValorRota,
  PARES_VALORES,
  RotaTabelaPreco,
  ValoresRotaDto,
  rotaIncompleta,
} from "@/src/model/tabela-preco";
import { criarRotaTabelaPreco } from "../../actions/criar-rota-tabela-preco";
import { atualizarRotaTabelaPreco } from "../../actions/atualizar-rota-tabela-preco";
import CidadeAutocomplete from "./cidade-autocomplete";

interface RotaTabelaPrecoModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  empresaId: string;
  /** Rota em edição; `null` cadastra uma nova. */
  rota: RotaTabelaPreco | null;
  onSucesso: (acao: "criada" | "atualizada") => void;
}

type Campos = Record<CampoValorRota | "cidadeOrigem" | "cidadeDestino" | "observacoes", string>;

const LADOS = [
  { titulo: "Empresa paga", lado: "empresa" },
  { titulo: "Cooperativa recebe", lado: "cooperativa" },
] as const;

const ROTULO_CAMPO: Record<CampoValorRota, string> = {
  preco: "Valor da rota",
  precoCooperativa: "Valor da rota",
  acrescimoRoteiroExtremo: "Roteiro extremo (acréscimo)",
  acrescimoRoteiroExtremoCooperativa: "Roteiro extremo (acréscimo)",
  valorHoraParada: "Hora parada (por hora)",
  valorHoraParadaCooperativa: "Hora parada (por hora)",
};

function camposIniciais(rota: RotaTabelaPreco | null): Campos {
  // Rota antiga vem com valores nulos: o campo fica vazio para o administrador preencher
  const valor = (v: number | null | undefined) => (v == null ? "" : v.toFixed(2));
  return {
    cidadeOrigem: rota?.cidadeOrigem ?? "",
    cidadeDestino: rota?.cidadeDestino ?? "",
    preco: valor(rota?.preco),
    precoCooperativa: valor(rota?.precoCooperativa),
    acrescimoRoteiroExtremo: valor(rota?.acrescimoRoteiroExtremo),
    acrescimoRoteiroExtremoCooperativa: valor(rota?.acrescimoRoteiroExtremoCooperativa),
    valorHoraParada: valor(rota?.valorHoraParada),
    valorHoraParadaCooperativa: valor(rota?.valorHoraParadaCooperativa),
    observacoes: rota?.observacoes ?? "",
  };
}

export default function RotaTabelaPrecoModal({
  isOpen,
  onOpenChange,
  empresaId,
  rota,
  onSucesso,
}: RotaTabelaPrecoModalProps) {
  const [campos, setCampos] = useState<Campos>(() => camposIniciais(rota));
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | undefined>(undefined);
  const [errosCampo, setErrosCampo] = useState<Record<string, string>>({});

  // Cada abertura começa do zero (ou dos valores da rota), mesmo se o modal foi fechado pelo X
  const [abertoAntes, setAbertoAntes] = useState(isOpen);
  if (isOpen !== abertoAntes) {
    setAbertoAntes(isOpen);
    if (isOpen) {
      setCampos(camposIniciais(rota));
      setErro(undefined);
      setErrosCampo({});
    }
  }

  const editando = rota !== null;

  function updateCampo(campo: keyof Campos, valor: string) {
    setCampos((prev) => ({ ...prev, [campo]: valor }));
  }

  // Não bloqueia: pode haver acordo em que a cooperativa recebe mais, mas quase sempre é digitação trocada
  const paresInvertidos = PARES_VALORES.filter((par) => {
    const empresa = campos[par.empresa];
    const cooperativa = campos[par.cooperativa];
    return empresa !== "" && cooperativa !== "" && Number(cooperativa) > Number(empresa);
  });

  async function handleSubmit() {
    setEnviando(true);
    setErro(undefined);
    setErrosCampo({});

    const valores: ValoresRotaDto = {
      preco: Number(campos.preco),
      precoCooperativa: Number(campos.precoCooperativa),
      acrescimoRoteiroExtremo: Number(campos.acrescimoRoteiroExtremo),
      acrescimoRoteiroExtremoCooperativa: Number(campos.acrescimoRoteiroExtremoCooperativa),
      valorHoraParada: Number(campos.valorHoraParada),
      valorHoraParadaCooperativa: Number(campos.valorHoraParadaCooperativa),
    };
    const observacoes = campos.observacoes.trim();

    const result = rota
      ? // O backend só mexe na observação se ela vier: vazia apaga a que existia, ausente mantém
        await atualizarRotaTabelaPreco(empresaId, rota.id, {
          ...valores,
          observacoes: observacoes || (rota.observacoes ? "" : undefined),
        })
      : await criarRotaTabelaPreco({
          ...valores,
          observacoes: observacoes || undefined,
          cidadeOrigem: campos.cidadeOrigem.trim(),
          cidadeDestino: campos.cidadeDestino.trim(),
          empresaId,
        });

    setEnviando(false);

    if (result.success) {
      onSucesso(rota ? "atualizada" : "criada");
      return;
    }

    if (result.errors) {
      setErrosCampo(result.errors);
      setErro("Confira os campos destacados.");
    } else {
      setErro(result.message ?? "Não foi possível salvar a rota.");
    }
  }

  return (
    <Modal>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
        <Modal.Container size="lg">
          <Modal.Dialog>
            {({ close }) => (
              <>
                <Modal.CloseTrigger />
                <Modal.Header>
                  <Modal.Heading>
                    {rota ? `Editar ${rota.cidadeOrigem} ↔ ${rota.cidadeDestino}` : "Nova rota"}
                  </Modal.Heading>
                </Modal.Header>
                <Modal.Body>
                  <Form
                    className="flex flex-col gap-5"
                    validationErrors={errosCampo}
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSubmit();
                    }}
                  >
                    {rota && rotaIncompleta(rota) ? (
                      <Alert status="warning">
                        <Alert.Indicator />
                        <Alert.Content>
                          <Alert.Title>Rota sem os valores da cooperativa e dos acréscimos</Alert.Title>
                          <Alert.Description>
                            Preencha os campos vazios. Até lá, o motorista não consegue lançar
                            roteiro extremo nem hora parada nas corridas desta rota.
                          </Alert.Description>
                        </Alert.Content>
                      </Alert>
                    ) : null}

                    <div className="flex flex-col gap-2 w-full">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {editando ? (
                          <>
                            <TextField value={campos.cidadeOrigem} isReadOnly>
                              <Label>Origem</Label>
                              <Input />
                            </TextField>
                            <TextField value={campos.cidadeDestino} isReadOnly>
                              <Label>Destino</Label>
                              <Input />
                            </TextField>
                          </>
                        ) : (
                          <>
                            <CidadeAutocomplete
                              label="Origem"
                              name="cidadeOrigem"
                              value={campos.cidadeOrigem}
                              onChange={(v) => updateCampo("cidadeOrigem", v)}
                            />
                            <CidadeAutocomplete
                              label="Destino"
                              name="cidadeDestino"
                              value={campos.cidadeDestino}
                              onChange={(v) => updateCampo("cidadeDestino", v)}
                            />
                          </>
                        )}
                      </div>
                      <p className="text-xs text-muted">
                        {editando
                          ? "Origem e destino não mudam depois do cadastro."
                          : "Vale nos dois sentidos. Origem e destino podem ser a mesma cidade (corridas dentro de Salvador, por exemplo)."}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                      {LADOS.map(({ titulo, lado }) => (
                        <Fieldset
                          key={lado}
                          // min-w-0: fieldset nasce com min-width: min-content e estoura a grade
                          className="min-w-0 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
                        >
                          <Fieldset.Legend>{titulo}</Fieldset.Legend>
                          <div className="flex flex-col gap-3">
                            {PARES_VALORES.map((par) => {
                              const campo = par[lado];
                              return (
                                <TextField
                                  key={campo}
                                  name={campo}
                                  type="number"
                                  value={campos[campo]}
                                  onChange={(v) => updateCampo(campo, v)}
                                  isRequired
                                >
                                  <Label>{ROTULO_CAMPO[campo]}</Label>
                                  <InputGroup>
                                    <InputGroup.Prefix>
                                      <span className="text-muted">R$</span>
                                    </InputGroup.Prefix>
                                    <InputGroup.Input
                                      className="min-w-0"
                                      min={par.minimo}
                                      step={0.01}
                                      inputMode="decimal"
                                      placeholder="0,00"
                                    />
                                  </InputGroup>
                                  <FieldError />
                                </TextField>
                              );
                            })}
                          </div>
                        </Fieldset>
                      ))}
                    </div>

                    <p className="text-xs text-muted -mt-2">
                      O roteiro extremo é somado quando o motorista marca a corrida assim. A hora
                      parada é cobrada proporcional aos minutos parados. Use 0 quando a rota não
                      tiver o acréscimo.
                    </p>

                    {paresInvertidos.length > 0 ? (
                      <Alert status="warning">
                        <Alert.Indicator />
                        <Alert.Content>
                          <Alert.Title>A cooperativa recebe mais do que a empresa paga</Alert.Title>
                          <Alert.Description>
                            Em {paresInvertidos.map((par) => par.rotulo.toLowerCase()).join(", ")}.
                            Confira os valores; se estiver certo, dá para salvar assim.
                          </Alert.Description>
                        </Alert.Content>
                      </Alert>
                    ) : null}

                    <TextField
                      name="observacoes"
                      value={campos.observacoes}
                      onChange={(v) => updateCampo("observacoes", v)}
                      className="w-full"
                    >
                      <Label>Observações (opcional)</Label>
                      <TextArea rows={2} placeholder="Ex.: acordo comercial de setembro/2026" />
                    </TextField>

                    {erro ? (
                      <p className="text-sm text-danger" role="alert">
                        {erro}
                      </p>
                    ) : null}

                    <div className="flex gap-2 justify-end w-full pt-2 pb-2">
                      <Button variant="tertiary" onPress={close} isDisabled={enviando}>
                        Cancelar
                      </Button>
                      <Button variant="primary" type="submit" isPending={enviando}>
                        {editando ? "Salvar valores" : "Cadastrar rota"}
                      </Button>
                    </div>
                  </Form>
                </Modal.Body>
              </>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
