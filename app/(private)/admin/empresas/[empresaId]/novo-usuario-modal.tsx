"use client";

import { useState } from "react";
import {
  Button,
  Card,
  Description,
  Form,
  Input,
  Label,
  ListBox,
  Modal,
  Select,
  TextField,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { CriarUsuarioEmpresaDto, ROLE_LABEL, Role } from "@/src/model/admin";
import { criarUsuarioEmpresa } from "../../actions/criar-usuario-empresa";

interface NovoUsuarioModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  empresaId: string;
  onSucesso: () => void;
}

/** Papéis que fazem sentido para uma conta vinculada a uma empresa. */
const PAPEIS: Role[] = ["EMPRESA", "ADMIN"];

const CAMPOS_VAZIOS: CriarUsuarioEmpresaDto = {
  firstname: "",
  lastname: "",
  username: "",
  password: "",
  role: "EMPRESA",
};

export default function NovoUsuarioModal({
  isOpen,
  onOpenChange,
  empresaId,
  onSucesso,
}: NovoUsuarioModalProps) {
  const [dados, setDados] = useState(CAMPOS_VAZIOS);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | undefined>(undefined);
  const [senhaTemporaria, setSenhaTemporaria] = useState<string | null>(null);

  function updateCampo<K extends keyof CriarUsuarioEmpresaDto>(
    campo: K,
    valor: CriarUsuarioEmpresaDto[K],
  ) {
    setDados((prev) => ({ ...prev, [campo]: valor }));
  }

  function resetar() {
    setDados(CAMPOS_VAZIOS);
    setErro(undefined);
    setSenhaTemporaria(null);
  }

  function handleClose(close: () => void) {
    resetar();
    close();
  }

  async function handleSubmit() {
    setEnviando(true);
    setErro(undefined);

    // Senha em branco vira senha temporária gerada pelo backend
    const payload: CriarUsuarioEmpresaDto = {
      ...dados,
      password: dados.password ? dados.password : undefined,
      lastname: dados.lastname ? dados.lastname : undefined,
    };

    const result = await criarUsuarioEmpresa(empresaId, payload);

    setEnviando(false);

    if (!result.success) {
      setErro(result.message ?? "Não foi possível criar o usuário.");
      return;
    }

    // A senha temporária só aparece nesta resposta; se houver, seguramos o modal aberto
    // para o administrador copiá-la antes de fechar
    if (result.data?.senhaTemporaria) {
      setSenhaTemporaria(result.data.senhaTemporaria);
      return;
    }

    resetar();
    onSucesso();
  }

  return (
    <Modal>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
        <Modal.Container size="md">
          <Modal.Dialog>
            {({ close }) => (
              <>
                <Modal.CloseTrigger />
                <Modal.Header>
                  <Modal.Heading>
                    {senhaTemporaria ? "Usuário criado" : "Novo usuário da empresa"}
                  </Modal.Heading>
                </Modal.Header>
                <Modal.Body>
                  {senhaTemporaria ? (
                    <div className="flex flex-col gap-4">
                      <Card className="border border-warning bg-warning-soft">
                        <Card.Content className="flex flex-col gap-3 p-4">
                          <div className="flex items-center gap-2">
                            <Icon
                              icon="solar:key-linear"
                              className="w-5 h-5 text-warning shrink-0"
                            />
                            <p className="text-sm font-semibold text-warning">
                              Senha temporária — anote agora
                            </p>
                          </div>
                          <p className="font-mono text-lg tracking-wider select-all">
                            {senhaTemporaria}
                          </p>
                          <p className="text-sm text-warning">
                            Ela não volta a ser exibida. Repasse ao usuário e oriente a troca no
                            primeiro acesso.
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

                      <TextField
                        value={dados.username}
                        onChange={(v) => updateCampo("username", v)}
                        isRequired
                      >
                        <Label>Nome de usuário</Label>
                        <Input />
                        <Description>É com ele que a pessoa faz login.</Description>
                      </TextField>

                      <Select
                        value={dados.role ?? "EMPRESA"}
                        onChange={(key) => updateCampo("role", (key?.toString() ?? "EMPRESA") as Role)}
                        isRequired
                      >
                        <Label>Papel</Label>
                        <Select.Trigger>
                          <Select.Value />
                          <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                          <ListBox>
                            {PAPEIS.map((papel) => (
                              <ListBox.Item key={papel} id={papel} textValue={ROLE_LABEL[papel]}>
                                {ROLE_LABEL[papel]}
                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                            ))}
                          </ListBox>
                        </Select.Popover>
                      </Select>

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
                          Criar e vincular
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
