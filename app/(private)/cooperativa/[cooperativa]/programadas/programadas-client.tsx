"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { Card } from "@heroui/react";
import { Chip } from "@heroui/react";
import { Tabs } from "@heroui/react";
import { TextField, InputGroup, CloseButton } from "@heroui/react";
import { Icon } from "@iconify/react";
import ActionButton from "./action/button";
import EncerrarButton from "./action/encerrar-button";

interface IResponse {
  nome: string;
  id: string;
}

interface IProgramadas {
  id: string;
  nomeEmpresa: string;
  enderecoEmpresa: string;
  nomesPassageiros: string[];
  enderecosPassageiros: string[];
  horaSaida: string;
  horaRetorno: string;
}

interface IProgramadaComMotorista {
  id: string;
  nomeEmpresa: string;
  enderecoEmpresa: string;
  nomesPassageiros: string[];
  enderecosPassageiros: string[];
  horaSaida: string;
  horaRetorno: string;
  tipoViagem: "Apanha" | "Retorno" | "APANHA_E_RETORNO";
  motoristaId: string;
  motoristaNome: string;
  motoristaTelefone: string;
  motoristaMatricula: string;
}

interface ProgramadasClientProps {
  programadasSemMotorista: IProgramadas[];
  programadasComMotorista: IProgramadaComMotorista[];
  motoristas: IResponse[];
  token: string;
}

const TIPO_VIAGEM_LABEL: Record<string, string> = {
  Apanha: "Apanha",
  Retorno: "Retorno",
  APANHA_E_RETORNO: "Ida e volta",
};

export default function ProgramadasClient({
  programadasSemMotorista,
  programadasComMotorista,
  motoristas,
  token,
}: ProgramadasClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"sem-motorista" | "com-motorista">("sem-motorista");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProgramadasSemMotorista = programadasSemMotorista.filter((transporte) => {
    if (!searchTerm) return true;
    return transporte.nomesPassageiros.some((nome) =>
      nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const filteredProgramadasComMotorista = programadasComMotorista.filter((viagem) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const motoristaMatch = viagem.motoristaNome.toLowerCase().includes(searchLower);
    const passageiroMatch = viagem.nomesPassageiros.some((nome) =>
      nome.toLowerCase().includes(searchLower)
    );
    return motoristaMatch || passageiroMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-4 sm:p-8 max-w-5xl">
        <header className="flex items-center gap-4 mb-6">
          <Button variant="secondary" onPress={() => router.back()}>
            ← Voltar
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Viagens Programadas
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Gerencie as viagens programadas da cooperativa
            </p>
          </div>
        </header>

        <Card className="mb-6">
          <Card.Content>
            <TextField
              value={searchTerm}
              onChange={setSearchTerm}
              aria-label="Buscar por passageiro ou motorista"
            >
              <InputGroup>
                <InputGroup.Prefix>
                  <Icon icon="solar:magnifer-linear" className="text-default-400" />
                </InputGroup.Prefix>
                <InputGroup.Input placeholder="Buscar por passageiro ou motorista..." />
                {searchTerm && (
                  <InputGroup.Suffix>
                    <CloseButton aria-label="Limpar busca" onPress={() => setSearchTerm("")} />
                  </InputGroup.Suffix>
                )}
              </InputGroup>
            </TextField>
          </Card.Content>
        </Card>

        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as "sem-motorista" | "com-motorista")}
        >
          <Tabs.ListContainer>
            <Tabs.List aria-label="Filtro de viagens programadas">
              <Tabs.Tab id="sem-motorista">
                Sem motorista ({filteredProgramadasSemMotorista.length})
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="com-motorista">
                <Tabs.Separator />
                Com motorista ({filteredProgramadasComMotorista.length})
                <Tabs.Indicator />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>

          <Tabs.Panel id="sem-motorista">
            <div className="flex flex-col gap-4 pt-6">
              {filteredProgramadasSemMotorista.length > 0 ? (
                filteredProgramadasSemMotorista.map((transporte) => (
                  <Card key={transporte.id}>
                    <Card.Header>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
                          <Icon icon="solar:route-linear" width={18} />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-default-700">
                            Viagem #{transporte.id.slice(0, 8).toUpperCase()}
                          </h3>
                          <p className="text-xs text-default-500">
                            {transporte.horaSaida} → {transporte.horaRetorno}
                          </p>
                        </div>
                      </div>
                    </Card.Header>

                    <Card.Content className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Icon
                            icon="solar:users-group-rounded-linear"
                            width={16}
                            className="text-default-500"
                          />
                          <span className="text-sm font-medium text-default-600">
                            Passageiros
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 ml-6">
                          {transporte.nomesPassageiros.map((nome, index) => (
                            <Chip key={index} color="accent" variant="tertiary" size="sm">
                              {nome}
                            </Chip>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Icon icon="solar:routing-linear" width={16} className="text-accent" />
                          <span className="text-sm font-medium text-default-600">Rota</span>
                        </div>

                        <div className="ml-6 space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success-soft mt-0.5 shrink-0">
                              <div className="h-2 w-2 rounded-full bg-success" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-success uppercase tracking-wide mb-1">
                                Origem
                              </p>
                              <p className="text-sm text-default-600 leading-relaxed truncate">
                                {transporte.enderecoEmpresa}
                              </p>
                            </div>
                          </div>

                          <div className="ml-3 h-4 w-px bg-linear-to-b from-success to-danger" />

                          <div className="flex items-start gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-danger-soft mt-0.5 shrink-0">
                              <div className="h-2 w-2 rounded-full bg-danger" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-danger uppercase tracking-wide mb-1">
                                Destino
                              </p>
                              <p className="text-sm text-default-600 leading-relaxed truncate">
                                {transporte.enderecosPassageiros[0]}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card.Content>

                    <Card.Footer className="bg-default-50 dark:bg-default-100/50">
                      <ActionButton
                        token={token}
                        motoristas={motoristas}
                        idProgramacao={transporte.id}
                      />
                    </Card.Footer>
                  </Card>
                ))
              ) : (
                <Card>
                  <Card.Content className="text-center py-12">
                    <Icon
                      icon="solar:routing-2-linear"
                      className="w-10 h-10 mx-auto text-gray-400 dark:text-gray-500 mb-4"
                    />
                    <p className="text-gray-500 dark:text-gray-400">
                      {searchTerm
                        ? `Nenhuma viagem sem motorista encontrada para "${searchTerm}"`
                        : "Nenhuma viagem aguardando atribuição de motorista"}
                    </p>
                  </Card.Content>
                </Card>
              )}
            </div>
          </Tabs.Panel>

          <Tabs.Panel id="com-motorista">
            <div className="flex flex-col gap-4 pt-6">
              {filteredProgramadasComMotorista.length > 0 ? (
                filteredProgramadasComMotorista.map((viagem) => (
                  <Card key={viagem.id}>
                    <Card.Header>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
                            <Icon icon="solar:route-linear" width={18} />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-default-700">
                              Viagem #{viagem.id.slice(0, 8).toUpperCase()}
                            </h3>
                            <p className="text-xs text-default-500">
                              {viagem.horaSaida} → {viagem.horaRetorno}
                            </p>
                          </div>
                        </div>
                        {viagem.tipoViagem && (
                          <Chip color="default" variant="tertiary" size="sm">
                            {TIPO_VIAGEM_LABEL[viagem.tipoViagem] ?? viagem.tipoViagem}
                          </Chip>
                        )}
                      </div>
                    </Card.Header>

                    <Card.Content className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Icon
                            icon="solar:user-id-linear"
                            width={16}
                            className="text-default-500"
                          />
                          <span className="text-sm font-medium text-default-600">Motorista</span>
                        </div>
                        <div className="ml-6">
                          <p className="text-sm font-semibold text-default-700">
                            {viagem.motoristaNome}
                          </p>
                          <div className="flex flex-wrap gap-3 mt-1">
                            <p className="text-xs text-default-500">
                              {viagem.motoristaTelefone}
                            </p>
                            <p className="text-xs text-default-500">
                              Matrícula {viagem.motoristaMatricula}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Icon
                            icon="solar:buildings-2-linear"
                            width={16}
                            className="text-default-500"
                          />
                          <span className="text-sm font-medium text-default-600">Empresa</span>
                        </div>
                        <p className="text-sm text-default-600 ml-6">{viagem.nomeEmpresa}</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Icon
                            icon="solar:users-group-rounded-linear"
                            width={16}
                            className="text-default-500"
                          />
                          <span className="text-sm font-medium text-default-600">
                            Passageiros
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 ml-6">
                          {viagem.nomesPassageiros.map((nome, index) => (
                            <Chip key={index} color="accent" variant="tertiary" size="sm">
                              {nome}
                            </Chip>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Icon icon="solar:routing-linear" width={16} className="text-accent" />
                          <span className="text-sm font-medium text-default-600">Rota</span>
                        </div>

                        <div className="ml-6 space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success-soft mt-0.5 shrink-0">
                              <div className="h-2 w-2 rounded-full bg-success" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-success uppercase tracking-wide mb-1">
                                Origem
                              </p>
                              <p className="text-sm text-default-600 leading-relaxed truncate">
                                {viagem.enderecoEmpresa}
                              </p>
                            </div>
                          </div>

                          <div className="ml-3 h-4 w-px bg-linear-to-b from-success to-danger" />

                          <div className="flex items-start gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-danger-soft mt-0.5 shrink-0">
                              <div className="h-2 w-2 rounded-full bg-danger" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-danger uppercase tracking-wide mb-1">
                                Destino
                              </p>
                              <p className="text-sm text-default-600 leading-relaxed truncate">
                                {viagem.enderecosPassageiros[0]}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card.Content>

                    <Card.Footer className="bg-default-50 dark:bg-default-100/50">
                      <EncerrarButton idProgramacao={viagem.id} token={token} />
                    </Card.Footer>
                  </Card>
                ))
              ) : (
                <Card>
                  <Card.Content className="text-center py-12">
                    <Icon
                      icon="solar:routing-2-linear"
                      className="w-10 h-10 mx-auto text-gray-400 dark:text-gray-500 mb-4"
                    />
                    <p className="text-gray-500 dark:text-gray-400">
                      {searchTerm
                        ? `Nenhuma viagem com motorista encontrada para "${searchTerm}"`
                        : "Nenhuma viagem com motorista atribuído"}
                    </p>
                  </Card.Content>
                </Card>
              )}
            </div>
          </Tabs.Panel>
        </Tabs>
      </div>
    </div>
  );
}
