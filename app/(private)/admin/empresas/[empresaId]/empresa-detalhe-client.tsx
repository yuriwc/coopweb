"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Card, Chip, Table, Tabs, useOverlayState } from "@heroui/react";
import { Icon } from "@iconify/react";
import ShowToast from "@/src/components/Toast";
import { ROLE_LABEL, Role, UsuarioEmpresa } from "@/src/model/admin";
import { Cooperativa } from "@/src/model/cooperativas";
import { Empresa } from "@/src/model/empresa";
import { Funcionario } from "@/src/model/funcionario";
import { RotaTabelaPreco, rotaIncompleta } from "@/src/model/tabela-preco";
import DesativarRotaModal from "./desativar-rota-modal";
import NovoUsuarioModal from "./novo-usuario-modal";
import RotaTabelaPrecoModal from "./rota-tabela-preco-modal";
import TabelaPrecosTable from "./tabela-precos-table";
import VincularCooperativaModal from "./vincular-cooperativa-modal";

type Aba = "funcionarios" | "usuarios" | "cooperativas" | "precos";

interface EmpresaDetalheClientProps {
  empresaId: string;
  empresa: Empresa | null;
  funcionarios: Funcionario[];
  usuarios: UsuarioEmpresa[];
  cooperativasVinculadas: { label: string; value: string }[];
  todasCooperativas: Cooperativa[];
  tabelaPreco: RotaTabelaPreco[];
}

function rotuloRole(role: Role | null) {
  return role ? ROLE_LABEL[role] : "Sem papel";
}

export default function EmpresaDetalheClient({
  empresaId,
  empresa,
  funcionarios,
  usuarios,
  cooperativasVinculadas,
  todasCooperativas,
  tabelaPreco,
}: EmpresaDetalheClientProps) {
  const router = useRouter();
  const [aba, setAba] = useState<Aba>("funcionarios");
  const novoUsuario = useOverlayState();
  const vincularCooperativa = useOverlayState();
  const formRota = useOverlayState();
  const desativarRota = useOverlayState();
  const [rotaSelecionada, setRotaSelecionada] = useState<RotaTabelaPreco | null>(null);

  const idsVinculados = new Set(cooperativasVinculadas.map((c) => c.value));
  const cooperativasDisponiveis = todasCooperativas.filter((c) => !idsVinculados.has(c.id));

  const rotas = [...tabelaPreco].sort(
    (a, b) =>
      a.cidadeOrigem.localeCompare(b.cidadeOrigem, "pt-BR") ||
      a.cidadeDestino.localeCompare(b.cidadeDestino, "pt-BR"),
  );
  const rotasIncompletas = rotas.filter(rotaIncompleta).length;

  function abrirNovaRota() {
    setRotaSelecionada(null);
    formRota.open();
  }

  function abrirEdicaoRota(rota: RotaTabelaPreco) {
    setRotaSelecionada(rota);
    formRota.open();
  }

  function abrirDesativacaoRota(rota: RotaTabelaPreco) {
    setRotaSelecionada(rota);
    desativarRota.open();
  }

  function handleRotaSalva(acao: "criada" | "atualizada") {
    formRota.close();
    ShowToast({ color: "success", title: acao === "criada" ? "Rota cadastrada" : "Rota atualizada" });
    router.refresh();
  }

  function handleRotaDesativada() {
    desativarRota.close();
    ShowToast({ color: "success", title: "Rota desativada" });
    router.refresh();
  }

  function handleUsuarioCriado() {
    novoUsuario.close();
    ShowToast({ color: "success", title: "Usuário criado e vinculado à empresa" });
    router.refresh();
  }

  function handleCooperativaVinculada() {
    vincularCooperativa.close();
    ShowToast({ color: "success", title: "Cooperativa vinculada à empresa" });
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-4 sm:p-8 max-w-6xl">
        <header className="flex items-center gap-4 mb-6">
          <Button variant="secondary" onPress={() => router.push("/admin/empresas")}>
            ← Voltar
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {empresa?.nome ?? "Empresa"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {empresa?.cnpj ? `CNPJ ${empresa.cnpj}` : "Dados da empresa indisponíveis"}
              {empresa?.cidade ? ` · ${empresa.cidade}/${empresa.estado}` : ""}
            </p>
          </div>
        </header>

        <Card>
          <Card.Content>
            <Tabs selectedKey={aba} onSelectionChange={(key) => setAba(key as Aba)}>
              <Tabs.ListContainer>
                <Tabs.List aria-label="Seções da empresa">
                  <Tabs.Tab id="funcionarios">
                    Funcionários ({funcionarios.length})
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="usuarios">
                    <Tabs.Separator />
                    Usuários ({usuarios.length})
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="cooperativas">
                    <Tabs.Separator />
                    Cooperativas ({cooperativasVinculadas.length})
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="precos">
                    <Tabs.Separator />
                    Tabela de preços ({rotas.length})
                    <Tabs.Indicator />
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs.ListContainer>

              <Tabs.Panel id="funcionarios">
                <div className="pt-4">
                  {funcionarios.length === 0 ? (
                    <div className="text-center py-12">
                      <Icon icon="solar:users-group-rounded-linear" className="w-12 h-12 mx-auto text-muted" />
                      <h3 className="text-lg font-semibold text-muted mt-4">
                        Nenhum funcionário cadastrado
                      </h3>
                      <p className="text-sm text-muted">
                        Funcionários são cadastrados pelo operador da empresa, na área da empresa.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <Table.ScrollContainer>
                          <Table.Content aria-label="Funcionários da empresa e seus códigos">
                            <Table.Header>
                              <Table.Column isRowHeader>NOME</Table.Column>
                              <Table.Column>CÓDIGO</Table.Column>
                              <Table.Column>TELEFONE</Table.Column>
                              <Table.Column>CIDADE</Table.Column>
                              <Table.Column>CENTRO DE CUSTO</Table.Column>
                            </Table.Header>
                            <Table.Body items={funcionarios}>
                              {(funcionario) => (
                                <Table.Row id={funcionario.id}>
                                  <Table.Cell>
                                    <span className="text-sm font-medium">{funcionario.name}</span>
                                  </Table.Cell>
                                  <Table.Cell>
                                    {funcionario.codigo ? (
                                      <span className="font-mono text-sm tracking-widest font-semibold">
                                        {funcionario.codigo}
                                      </span>
                                    ) : (
                                      <span className="text-muted italic text-sm">sem código</span>
                                    )}
                                  </Table.Cell>
                                  <Table.Cell>
                                    <span className="text-sm">
                                      {funcionario.phone ?? (
                                        <span className="text-muted italic">não informado</span>
                                      )}
                                    </span>
                                  </Table.Cell>
                                  <Table.Cell>
                                    <span className="text-sm">
                                      {funcionario.cidade
                                        ? `${funcionario.cidade}/${funcionario.estado}`
                                        : "—"}
                                    </span>
                                  </Table.Cell>
                                  <Table.Cell>
                                    <span className="text-sm">
                                      {funcionario.centroCustoCodigo ?? (
                                        <span className="text-muted italic">não vinculado</span>
                                      )}
                                    </span>
                                  </Table.Cell>
                                </Table.Row>
                              )}
                            </Table.Body>
                          </Table.Content>
                        </Table.ScrollContainer>
                      </Table>
                    </div>
                  )}
                </div>
              </Tabs.Panel>

              <Tabs.Panel id="usuarios">
                <div className="pt-4 space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Contas que acessam o sistema em nome desta empresa.
                    </p>
                    <Button variant="primary" size="sm" onPress={novoUsuario.open}>
                      <Icon icon="solar:user-plus-linear" className="w-4 h-4" />
                      Novo usuário
                    </Button>
                  </div>

                  {usuarios.length === 0 ? (
                    <div className="text-center py-12">
                      <Icon icon="solar:user-cross-linear" className="w-12 h-12 mx-auto text-muted" />
                      <h3 className="text-lg font-semibold text-muted mt-4">
                        Nenhum usuário vinculado
                      </h3>
                      <p className="text-sm text-muted">
                        Sem usuário vinculado, ninguém consegue operar esta empresa no sistema.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <Table.ScrollContainer>
                          <Table.Content aria-label="Usuários vinculados à empresa">
                            <Table.Header>
                              <Table.Column isRowHeader>NOME</Table.Column>
                              <Table.Column>USUÁRIO</Table.Column>
                              <Table.Column>PAPEL</Table.Column>
                            </Table.Header>
                            <Table.Body items={usuarios}>
                              {(usuario) => (
                                <Table.Row id={usuario.id}>
                                  <Table.Cell>
                                    <span className="text-sm font-medium">
                                      {[usuario.firstname, usuario.lastname]
                                        .filter(Boolean)
                                        .join(" ") || (
                                        <span className="text-muted italic">não informado</span>
                                      )}
                                    </span>
                                  </Table.Cell>
                                  <Table.Cell>
                                    <span className="text-sm font-mono">{usuario.username}</span>
                                  </Table.Cell>
                                  <Table.Cell>
                                    <Chip size="sm" variant="secondary">
                                      {rotuloRole(usuario.role)}
                                    </Chip>
                                  </Table.Cell>
                                </Table.Row>
                              )}
                            </Table.Body>
                          </Table.Content>
                        </Table.ScrollContainer>
                      </Table>
                    </div>
                  )}
                </div>
              </Tabs.Panel>

              <Tabs.Panel id="cooperativas">
                <div className="pt-4 space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Cooperativas que atendem esta empresa.
                    </p>
                    <Button
                      variant="primary"
                      size="sm"
                      onPress={vincularCooperativa.open}
                      isDisabled={cooperativasDisponiveis.length === 0}
                    >
                      <Icon icon="solar:link-linear" className="w-4 h-4" />
                      Vincular cooperativa
                    </Button>
                  </div>

                  {cooperativasVinculadas.length === 0 ? (
                    <div className="text-center py-12">
                      <Icon icon="solar:users-group-two-rounded-linear" className="w-12 h-12 mx-auto text-muted" />
                      <h3 className="text-lg font-semibold text-muted mt-4">
                        Nenhuma cooperativa vinculada
                      </h3>
                      <p className="text-sm text-muted">
                        Sem cooperativa, as viagens desta empresa não chegam a nenhum motorista.
                      </p>
                    </div>
                  ) : (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {cooperativasVinculadas.map((cooperativa) => (
                        <li key={cooperativa.value}>
                          <Card className="border border-gray-200 dark:border-gray-700">
                            <Card.Content className="flex items-center gap-3 p-4">
                              <div className="p-2 bg-accent-soft rounded-lg">
                                <Icon
                                  icon="solar:users-group-rounded-linear"
                                  className="w-5 h-5 text-accent"
                                />
                              </div>
                              <span className="text-sm font-medium">{cooperativa.label}</span>
                            </Card.Content>
                          </Card>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Tabs.Panel>

              <Tabs.Panel id="precos">
                <div className="pt-4 space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Preço fixo por rota: quanto a empresa paga e quanto a cooperativa recebe.
                      Cada rota vale nos dois sentidos.
                    </p>
                    <Button variant="primary" size="sm" onPress={abrirNovaRota}>
                      <Icon icon="solar:add-circle-linear" className="w-4 h-4" />
                      Nova rota
                    </Button>
                  </div>

                  {rotasIncompletas > 0 ? (
                    <Alert status="warning">
                      <Alert.Indicator />
                      <Alert.Content>
                        <Alert.Title>
                          {rotasIncompletas === 1
                            ? "1 rota precisa ser atualizada"
                            : `${rotasIncompletas} rotas precisam ser atualizadas`}
                        </Alert.Title>
                        <Alert.Description>
                          Cadastradas antes dos valores da cooperativa e dos acréscimos, estão sem
                          esses valores. Enquanto isso, o motorista não consegue lançar roteiro
                          extremo nem hora parada nessas corridas. Use Editar para preencher.
                        </Alert.Description>
                      </Alert.Content>
                    </Alert>
                  ) : null}

                  {rotas.length === 0 ? (
                    <div className="text-center py-12">
                      <Icon icon="solar:tag-price-linear" className="w-12 h-12 mx-auto text-muted" />
                      <h3 className="text-lg font-semibold text-muted mt-4">
                        Nenhuma rota com preço fixo
                      </h3>
                      <p className="text-sm text-muted">
                        Viagens entre cidades sem rota cadastrada não recebem preço de tabela.
                      </p>
                    </div>
                  ) : (
                    <TabelaPrecosTable
                      rotas={rotas}
                      onEditar={abrirEdicaoRota}
                      onDesativar={abrirDesativacaoRota}
                    />
                  )}
                </div>
              </Tabs.Panel>
            </Tabs>
          </Card.Content>
        </Card>
      </div>

      <NovoUsuarioModal
        isOpen={novoUsuario.isOpen}
        onOpenChange={novoUsuario.setOpen}
        empresaId={empresaId}
        onSucesso={handleUsuarioCriado}
      />

      <VincularCooperativaModal
        isOpen={vincularCooperativa.isOpen}
        onOpenChange={vincularCooperativa.setOpen}
        empresaId={empresaId}
        cooperativas={cooperativasDisponiveis}
        onSucesso={handleCooperativaVinculada}
      />

      <RotaTabelaPrecoModal
        isOpen={formRota.isOpen}
        onOpenChange={formRota.setOpen}
        empresaId={empresaId}
        rota={rotaSelecionada}
        onSucesso={handleRotaSalva}
      />

      <DesativarRotaModal
        isOpen={desativarRota.isOpen}
        onOpenChange={desativarRota.setOpen}
        empresaId={empresaId}
        rota={rotaSelecionada}
        onSucesso={handleRotaDesativada}
      />
    </div>
  );
}
