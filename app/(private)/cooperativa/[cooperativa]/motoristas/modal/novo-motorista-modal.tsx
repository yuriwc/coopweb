"use client";

import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
} from "@heroui/modal";
import { Tabs, Tab } from "@heroui/tabs";
import { Form } from "@heroui/form";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
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
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Novo motorista</ModalHeader>
            <ModalBody>
              <Tabs
                selectedKey={activeTab}
                onSelectionChange={(key) => setActiveTab(key as "manual" | "planilha")}
                fullWidth
              >
                <Tab key="manual" title="Manual">
                  <Form
                    className="flex flex-col gap-4 pt-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSubmitManual();
                    }}
                  >
                    <Input
                      label="CPF"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onValueChange={setCpf}
                      isRequired
                    />
                    <Input
                      label="CNH"
                      value={cnh}
                      onValueChange={setCnh}
                      isRequired
                    />
                    <div className="grid grid-cols-3 gap-3 w-full">
                      <Input
                        className="col-span-2"
                        label="Rua"
                        value={endereco.rua}
                        onValueChange={(v) => setEndereco((prev) => ({ ...prev, rua: v }))}
                        isRequired
                      />
                      <Input
                        label="Número"
                        value={endereco.numero}
                        onValueChange={(v) => setEndereco((prev) => ({ ...prev, numero: v }))}
                        isRequired
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3 w-full">
                      <Input
                        label="Bairro"
                        value={endereco.bairro}
                        onValueChange={(v) => setEndereco((prev) => ({ ...prev, bairro: v }))}
                        isRequired
                      />
                      <Input
                        label="Cidade"
                        value={endereco.cidade}
                        onValueChange={(v) => setEndereco((prev) => ({ ...prev, cidade: v }))}
                        isRequired
                      />
                      <Input
                        label="Estado"
                        maxLength={2}
                        value={endereco.estado}
                        onValueChange={(v) => setEndereco((prev) => ({ ...prev, estado: v }))}
                        isRequired
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 w-full">
                      <Input
                        label="CEP"
                        value={endereco.cep}
                        onValueChange={(v) => setEndereco((prev) => ({ ...prev, cep: v }))}
                        isRequired
                      />
                      <Input
                        label="Telefone"
                        value={endereco.telefone}
                        onValueChange={(v) => setEndereco((prev) => ({ ...prev, telefone: v }))}
                        isRequired
                      />
                    </div>
                    <Input
                      label="E-mail (opcional)"
                      value={endereco.email}
                      onValueChange={(v) => setEndereco((prev) => ({ ...prev, email: v }))}
                    />
                    <Input
                      label="Referência (opcional)"
                      value={endereco.referencia}
                      onValueChange={(v) => setEndereco((prev) => ({ ...prev, referencia: v }))}
                    />

                    {erroManual ? (
                      <p className="text-sm text-danger" role="alert">
                        {erroManual}
                      </p>
                    ) : null}

                    <div className="flex gap-2 justify-end w-full pt-2">
                      <Button variant="light" onPress={() => handleClose(onClose)} isDisabled={enviandoManual}>
                        Cancelar
                      </Button>
                      <Button color="primary" type="submit" isLoading={enviandoManual}>
                        Cadastrar
                      </Button>
                    </div>
                  </Form>
                </Tab>

                <Tab key="planilha" title="Importar planilha">
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
                        <CardBody className="flex flex-row gap-3 items-center">
                          <Icon icon="solar:document-text-linear" className="w-6 h-6 text-primary" />
                          <div className="flex flex-col gap-1">
                            <span className="text-sm text-default-600">Resumo da importação</span>
                            <div className="flex gap-2">
                              <Chip size="sm" variant="flat">{resumo.totalLinhas} processadas</Chip>
                              <Chip size="sm" color="success" variant="flat">{resumo.sucesso} com sucesso</Chip>
                              {resumo.erro > 0 ? (
                                <Chip size="sm" color="danger" variant="flat">{resumo.erro} com erro</Chip>
                              ) : null}
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    ) : null}

                    <div className="flex gap-2 justify-end w-full pt-2">
                      <Button variant="light" onPress={() => handleClose(onClose)} isDisabled={enviandoPlanilha}>
                        {resumo ? "Fechar" : "Cancelar"}
                      </Button>
                      {!resumo ? (
                        <Button
                          color="primary"
                          isLoading={enviandoPlanilha}
                          isDisabled={!arquivo}
                          onPress={handleSubmitPlanilha}
                        >
                          Enviar planilha
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </Tab>
              </Tabs>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
