"use client";

import { useState } from "react";
import { Button, Card, Description, Form, Input, Label, Modal, TextField } from "@heroui/react";
import { Icon } from "@iconify/react";
import { CriarMotoristaDto } from "@/src/model/admin";
import { criarMotorista } from "../../actions/criar-motorista";

interface NovoMotoristaModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  cooperativaCodigo: string;
  onSucesso: () => void;
}

type CamposFormulario = Omit<CriarMotoristaDto, "cooperativaCode">;

const CAMPOS_VAZIOS: CamposFormulario = {
  cpf: "",
  firstname: "",
  lastname: "",
  password: "",
  cnh: "",
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
  onSucesso,
}: NovoMotoristaModalProps) {
  const [dados, setDados] = useState(CAMPOS_VAZIOS);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | undefined>(undefined);
  const [credenciais, setCredenciais] = useState<{ username: string; senha: string } | null>(null);

  function updateCampo<K extends keyof CamposFormulario>(campo: K, valor: CamposFormulario[K]) {
    setDados((prev) => ({ ...prev, [campo]: valor }));
  }

  function resetar() {
    setDados(CAMPOS_VAZIOS);
    setErro(undefined);
    setCredenciais(null);
  }

  function handleClose(close: () => void) {
    resetar();
    close();
  }

  async function handleSubmit() {
    setEnviando(true);
    setErro(undefined);

    const result = await criarMotorista({
      ...dados,
      cooperativaCode: cooperativaCodigo,
      password: dados.password ? dados.password : undefined,
      lastname: dados.lastname ? dados.lastname : undefined,
    });

    setEnviando(false);

    if (!result.success) {
      setErro(result.message ?? "Não foi possível cadastrar o motorista.");
      return;
    }

    // A senha temporária só existe nesta resposta — seguramos o modal para o administrador copiar
    if (result.data?.senhaTemporaria) {
      setCredenciais({
        username: result.data.username,
        senha: result.data.senhaTemporaria,
      });
      return;
    }

    resetar();
    onSucesso();
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
                    {credenciais ? "Motorista cadastrado" : "Novo motorista"}
                  </Modal.Heading>
                </Modal.Header>
                <Modal.Body>
                  {credenciais ? (
                    <div className="flex flex-col gap-4">
                      <Card className="border border-warning bg-warning-soft">
                        <Card.Content className="flex flex-col gap-3 p-4">
                          <div className="flex items-center gap-2">
                            <Icon icon="solar:key-linear" className="w-5 h-5 text-warning shrink-0" />
                            <p className="text-sm font-semibold text-warning">
                              Acesso do motorista — anote agora
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-warning">Usuário</p>
                            <p className="font-mono text-lg tracking-wider select-all">
                              {credenciais.username}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-warning">Senha temporária</p>
                            <p className="font-mono text-lg tracking-wider select-all">
                              {credenciais.senha}
                            </p>
                          </div>
                          <p className="text-sm text-warning">
                            A senha não volta a ser exibida. Repasse ao motorista e oriente a troca
                            no primeiro acesso.
                          </p>
                        </Card.Content>
                      </Card>

                      <div className="flex justify-end w-full pt-2 pb-2">
                        <Button
                          variant="primary"
                          onPress={() => {
                            resetar();
                            onSucesso();
                          }}
                        >
                          Concluir
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Form
                      className="flex flex-col gap-4"
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit();
                      }}
                    >
                      <div className="grid grid-cols-2 gap-3 w-full">
                        <TextField
                          value={dados.firstname}
                          onChange={(v) => updateCampo("firstname", v)}
                          isRequired
                        >
                          <Label>Nome</Label>
                          <Input />
                        </TextField>
                        <TextField
                          value={dados.lastname ?? ""}
                          onChange={(v) => updateCampo("lastname", v)}
                        >
                          <Label>Sobrenome</Label>
                          <Input />
                        </TextField>
                      </div>

                      <div className="grid grid-cols-2 gap-3 w-full">
                        <TextField
                          value={dados.cpf}
                          onChange={(v) => updateCampo("cpf", v)}
                          isRequired
                        >
                          <Label>CPF</Label>
                          <Input placeholder="000.000.000-00" />
                          <Description>É também o login do motorista no aplicativo.</Description>
                        </TextField>
                        <TextField
                          value={dados.cnh}
                          onChange={(v) => updateCampo("cnh", v)}
                          isRequired
                        >
                          <Label>CNH</Label>
                          <Input />
                        </TextField>
                      </div>

                      <TextField
                        type="password"
                        value={dados.password ?? ""}
                        onChange={(v) => updateCampo("password", v)}
                      >
                        <Label>Senha (opcional)</Label>
                        <Input />
                        <Description>
                          Em branco, o sistema gera uma senha temporária e mostra aqui uma única vez.
                          Se preencher, use ao menos 6 caracteres.
                        </Description>
                      </TextField>

                      <div className="grid grid-cols-3 gap-3 w-full">
                        <TextField
                          className="col-span-2"
                          value={dados.rua}
                          onChange={(v) => updateCampo("rua", v)}
                          isRequired
                        >
                          <Label>Rua</Label>
                          <Input />
                        </TextField>
                        <TextField
                          value={dados.numero}
                          onChange={(v) => updateCampo("numero", v)}
                          isRequired
                        >
                          <Label>Número</Label>
                          <Input />
                        </TextField>
                      </div>

                      <div className="grid grid-cols-3 gap-3 w-full">
                        <TextField
                          value={dados.bairro}
                          onChange={(v) => updateCampo("bairro", v)}
                          isRequired
                        >
                          <Label>Bairro</Label>
                          <Input />
                        </TextField>
                        <TextField
                          value={dados.cidade}
                          onChange={(v) => updateCampo("cidade", v)}
                          isRequired
                        >
                          <Label>Cidade</Label>
                          <Input />
                        </TextField>
                        <TextField
                          value={dados.estado}
                          onChange={(v) => updateCampo("estado", v)}
                          isRequired
                        >
                          <Label>Estado</Label>
                          <Input maxLength={2} placeholder="SP" />
                        </TextField>
                      </div>

                      <div className="grid grid-cols-2 gap-3 w-full">
                        <TextField
                          value={dados.cep}
                          onChange={(v) => updateCampo("cep", v)}
                          isRequired
                        >
                          <Label>CEP</Label>
                          <Input />
                        </TextField>
                        <TextField
                          value={dados.telefone}
                          onChange={(v) => updateCampo("telefone", v)}
                          isRequired
                        >
                          <Label>Telefone</Label>
                          <Input />
                        </TextField>
                      </div>

                      <TextField value={dados.email ?? ""} onChange={(v) => updateCampo("email", v)}>
                        <Label>E-mail (opcional)</Label>
                        <Input />
                      </TextField>

                      {erro ? (
                        <p className="text-sm text-danger" role="alert">
                          {erro}
                        </p>
                      ) : null}

                      <div className="flex gap-2 justify-end w-full pt-2 pb-2">
                        <Button
                          variant="tertiary"
                          onPress={() => handleClose(close)}
                          isDisabled={enviando}
                        >
                          Cancelar
                        </Button>
                        <Button variant="primary" type="submit" isPending={enviando}>
                          Cadastrar motorista
                        </Button>
                      </div>
                    </Form>
                  )}
                </Modal.Body>
              </>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
