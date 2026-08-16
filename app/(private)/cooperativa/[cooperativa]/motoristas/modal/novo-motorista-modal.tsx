"use client";

import { useState } from "react";
import { Modal } from "@heroui/react";
import { Tabs } from "@heroui/react";
import { Form } from "@heroui/react";
import { TextField, Label, Input } from "@heroui/react";
import { Button } from "@heroui/react";
import { Card } from "@heroui/react";
import { Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { cadastrarMotoristaManual } from "../action/cadastrar-motorista-manual";
import { importarMotoristas } from "../action/importar-motoristas";
import { CadastroMotoristaManualDto, ImportacaoMotoristasResumo } from "../../../../../../src/model/motorista";

interface NovoMotoristaModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  cooperativaCodigo: string;
  token: string;
  onCadastroManualSucesso: () => void;
  onImportacaoSucesso: () => void;
}

const CAMPOS_ENDERECO_VAZIOS = {
  rua: "",
  numero: "",
  bairro: "",
  cidade: "",
  cep: "",
  estado: "",
  telefone: "",
  email: "",
  referencia: "",
};

export default function NovoMotoristaModal({
  isOpen,
  onOpenChange,
  cooperativaCodigo,
  token,
  onCadastroManualSucesso,
  onImportacaoSucesso,
}: NovoMotoristaModalProps) {
  const [activeTab, setActiveTab] = useState<"manual" | "planilha">("manual");

  // Aba Manual
  const [cpf, setCpf] = useState("");
  const [cnh, setCnh] = useState("");
  const [endereco, setEndereco] = useState(CAMPOS_ENDERECO_VAZIOS);
  const [enviandoManual, setEnviandoManual] = useState(false);
  const [erroManual, setErroManual] = useState<string | undefined>(undefined);

  // Aba Importar planilha
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [enviandoPlanilha, setEnviandoPlanilha] = useState(false);
  const [erroPlanilha, setErroPlanilha] = useState<string | undefined>(undefined);
  const [resumo, setResumo] = useState<ImportacaoMotoristasResumo | null>(null);

  function resetManual() {
    setCpf("");
    setCnh("");
    setEndereco(CAMPOS_ENDERECO_VAZIOS);
    setErroManual(undefined);
  }

  function resetPlanilha() {
    setArquivo(null);
    setErroPlanilha(undefined);
    setResumo(null);
  }

  function handleClose(onClose: () => void) {
    resetManual();
    resetPlanilha();
    setActiveTab("manual");
    onClose();
  }

  async function handleSubmitManual() {
    setEnviandoManual(true);
    setErroManual(undefined);

    const dados: CadastroMotoristaManualDto = { cnh, ...endereco };
    const result = await cadastrarMotoristaManual({ cpf, cooperativaCode: cooperativaCodigo, dados, token });

    setEnviandoManual(false);

    if (result.success) {
      resetManual();
      onCadastroManualSucesso();
    } else {
      setErroManual(result.message ?? "Não foi possível cadastrar o motorista.");
    }
  }

  async function handleSubmitPlanilha() {
    if (!arquivo) return;

    setEnviandoPlanilha(true);
    setErroPlanilha(undefined);

    const result = await importarMotoristas({ cooperativaCode: cooperativaCodigo, arquivo, token });

    setEnviandoPlanilha(false);

    if (result.success && result.resumo) {
      setResumo(result.resumo);
      onImportacaoSucesso();
    } else {
      setErroPlanilha(result.message ?? "Não foi possível importar a planilha.");
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
                  <Modal.Heading>Novo motorista</Modal.Heading>
                </Modal.Header>
                <Modal.Body>
              <Tabs
                selectedKey={activeTab}
                onSelectionChange={(key) => setActiveTab(key as "manual" | "planilha")}
              >
                <Tabs.ListContainer>
                  <Tabs.List aria-label="Forma de cadastro">
                    <Tabs.Tab id="manual">
                      Manual
                      <Tabs.Indicator />
                    </Tabs.Tab>
                    <Tabs.Tab id="planilha">
                      <Tabs.Separator />
                      Importar planilha
                      <Tabs.Indicator />
                    </Tabs.Tab>
                  </Tabs.List>
                </Tabs.ListContainer>
                <Tabs.Panel id="manual">
                  <Form
                    className="flex flex-col gap-4 pt-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSubmitManual();
                    }}
                  >
                    <TextField value={cpf} onChange={setCpf} isRequired>
                      <Label>CPF</Label>
                      <Input placeholder="000.000.000-00" />
                    </TextField>
                    <TextField value={cnh} onChange={setCnh} isRequired>
                      <Label>CNH</Label>
                      <Input />
                    </TextField>
                    <div className="grid grid-cols-3 gap-3 w-full">
                      <TextField
                        className="col-span-2"
                        value={endereco.rua}
                        onChange={(v) => setEndereco((prev) => ({ ...prev, rua: v }))}
                        isRequired
                      >
                        <Label>Rua</Label>
                        <Input />
                      </TextField>
                      <TextField
                        value={endereco.numero}
                        onChange={(v) => setEndereco((prev) => ({ ...prev, numero: v }))}
                        isRequired
                      >
                        <Label>Número</Label>
                        <Input />
                      </TextField>
                    </div>
                    <div className="grid grid-cols-3 gap-3 w-full">
                      <TextField
                        value={endereco.bairro}
                        onChange={(v) => setEndereco((prev) => ({ ...prev, bairro: v }))}
                        isRequired
                      >
                        <Label>Bairro</Label>
                        <Input />
                      </TextField>
                      <TextField
                        value={endereco.cidade}
                        onChange={(v) => setEndereco((prev) => ({ ...prev, cidade: v }))}
                        isRequired
                      >
                        <Label>Cidade</Label>
                        <Input />
                      </TextField>
                      <TextField
                        value={endereco.estado}
                        onChange={(v) => setEndereco((prev) => ({ ...prev, estado: v }))}
                        isRequired
                      >
                        <Label>Estado</Label>
                        <Input maxLength={2} />
                      </TextField>
                    </div>
                    <div className="grid grid-cols-2 gap-3 w-full">
                      <TextField
                        value={endereco.cep}
                        onChange={(v) => setEndereco((prev) => ({ ...prev, cep: v }))}
                        isRequired
                      >
                        <Label>CEP</Label>
                        <Input />
                      </TextField>
                      <TextField
                        value={endereco.telefone}
                        onChange={(v) => setEndereco((prev) => ({ ...prev, telefone: v }))}
                        isRequired
                      >
                        <Label>Telefone</Label>
                        <Input />
                      </TextField>
                    </div>
                    <TextField
                      value={endereco.email}
                      onChange={(v) => setEndereco((prev) => ({ ...prev, email: v }))}
                    >
                      <Label>E-mail (opcional)</Label>
                      <Input />
                    </TextField>
                    <TextField
                      value={endereco.referencia}
                      onChange={(v) => setEndereco((prev) => ({ ...prev, referencia: v }))}
                    >
                      <Label>Referência (opcional)</Label>
                      <Input />
                    </TextField>

                    {erroManual ? (
                      <p className="text-sm text-danger" role="alert">
                        {erroManual}
                      </p>
                    ) : null}

                    <div className="flex gap-2 justify-end w-full pt-2">
                      <Button variant="tertiary" onPress={() => handleClose(close)} isDisabled={enviandoManual}>
                        Cancelar
                      </Button>
                      <Button variant="primary" type="submit" isPending={enviandoManual}>
                        Cadastrar
                      </Button>
                    </div>
                  </Form>
                </Tabs.Panel>

                <Tabs.Panel id="planilha">
                  <div className="flex flex-col gap-4 pt-2">
                    <label className="flex flex-col gap-2">
                      <span className="text-sm text-default-600">Planilha de motoristas (.xlsx, .xls)</span>
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        aria-label="Selecionar planilha de motoristas"
                        onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
                        className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-default-100 file:px-3 file:py-2 file:text-sm dark:file:bg-default-50 dark:text-default-200"
                      />
                    </label>

                    {erroPlanilha ? (
                      <p className="text-sm text-danger" role="alert">
                        {erroPlanilha}
                      </p>
                    ) : null}

                    {resumo ? (
                      <Card>
                        <Card.Content className="flex flex-row gap-3 items-center">
                          <Icon icon="solar:document-text-linear" className="w-6 h-6 text-accent" />
                          <div className="flex flex-col gap-1">
                            <span className="text-sm text-default-600">Resumo da importação</span>
                            <div className="flex gap-2">
                              <Chip size="sm" variant="tertiary">{resumo.totalLinhas} processadas</Chip>
                              <Chip size="sm" color="success" variant="tertiary">{resumo.sucesso} com sucesso</Chip>
                              {resumo.erro > 0 ? (
                                <Chip size="sm" color="danger" variant="tertiary">{resumo.erro} com erro</Chip>
                              ) : null}
                            </div>
                          </div>
                        </Card.Content>
                      </Card>
                    ) : null}

                    <div className="flex gap-2 justify-end w-full pt-2">
                      <Button variant="tertiary" onPress={() => handleClose(close)} isDisabled={enviandoPlanilha}>
                        {resumo ? "Fechar" : "Cancelar"}
                      </Button>
                      {!resumo ? (
                        <Button
                          variant="primary"
                          isPending={enviandoPlanilha}
                          isDisabled={!arquivo}
                          onPress={handleSubmitPlanilha}
                        >
                          Enviar planilha
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </Tabs.Panel>
              </Tabs>
                </Modal.Body>
              </>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
