"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Form } from "@heroui/form";
import { Input } from "@heroui/input";
import ShowToast from "../../../../../../src/components/Toast";
import { cadastrarEmpresa } from "./action/cadastrar-empresa";
import { CadastroEmpresaDto } from "../../../../../../src/model/empresa";

interface EmpresaFormProps {
  cooperativaId: string;
  token: string;
}

const CAMPOS_VAZIOS: Omit<CadastroEmpresaDto, "cooperativaID"> = {
  nome: "",
  cnpj: "",
  dataFechamento: 10,
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

export default function EmpresaForm({ cooperativaId, token }: EmpresaFormProps) {
  const router = useRouter();
  const [dados, setDados] = useState(CAMPOS_VAZIOS);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | undefined>(undefined);

  function updateCampo<K extends keyof typeof CAMPOS_VAZIOS>(campo: K, valor: (typeof CAMPOS_VAZIOS)[K]) {
    setDados((prev) => ({ ...prev, [campo]: valor }));
  }

  async function handleSubmit() {
    setEnviando(true);
    setErro(undefined);

    const result = await cadastrarEmpresa({
      dados: { ...dados, cooperativaID: cooperativaId },
      token,
    });

    setEnviando(false);

    if (result.success) {
      setDados(CAMPOS_VAZIOS);
      ShowToast({ color: "success", title: "Empresa cadastrada com sucesso" });
    } else {
      setErro(result.message ?? "Erro ao cadastrar empresa. Tente novamente.");
      ShowToast({ color: "danger", title: "Não foi possível cadastrar a empresa", description: result.message });
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-4 sm:p-8 max-w-3xl">
        <header className="flex items-center gap-4 mb-6">
          <Button variant="bordered" onPress={() => router.back()}>
            ← Voltar
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Cadastrar Empresa
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Nova empresa cliente da cooperativa
            </p>
          </div>
        </header>

        <Card>
          <CardHeader>
            <p className="text-md font-semibold">Dados da empresa</p>
          </CardHeader>
          <CardBody>
            <Form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <Input
                label="Nome da empresa"
                value={dados.nome}
                onValueChange={(v) => updateCampo("nome", v)}
                isRequired
              />
              <Input
                label="CNPJ"
                placeholder="00.000.000/0000-00"
                value={dados.cnpj}
                onValueChange={(v) => updateCampo("cnpj", v)}
                isRequired
              />
              <Input
                label="Dia de fechamento"
                type="number"
                min={1}
                max={31}
                description="Dia do mês em que o ciclo de faturamento fecha (1-31)"
                value={String(dados.dataFechamento)}
                onValueChange={(v) => updateCampo("dataFechamento", Number(v) || 10)}
                isRequired
              />

              <div className="grid grid-cols-3 gap-3 w-full">
                <Input
                  className="col-span-2"
                  label="Rua"
                  value={dados.rua}
                  onValueChange={(v) => updateCampo("rua", v)}
                  isRequired
                />
                <Input
                  label="Número"
                  value={dados.numero}
                  onValueChange={(v) => updateCampo("numero", v)}
                  isRequired
                />
              </div>

              <div className="grid grid-cols-3 gap-3 w-full">
                <Input
                  label="Bairro"
                  value={dados.bairro}
                  onValueChange={(v) => updateCampo("bairro", v)}
                  isRequired
                />
                <Input
                  label="Cidade"
                  value={dados.cidade}
                  onValueChange={(v) => updateCampo("cidade", v)}
                  isRequired
                />
                <Input
                  label="Estado"
                  maxLength={2}
                  value={dados.estado}
                  onValueChange={(v) => updateCampo("estado", v)}
                  isRequired
                />
              </div>

              <div className="grid grid-cols-2 gap-3 w-full">
                <Input
                  label="CEP"
                  value={dados.cep}
                  onValueChange={(v) => updateCampo("cep", v)}
                  isRequired
                />
                <Input
                  label="Telefone"
                  value={dados.telefone}
                  onValueChange={(v) => updateCampo("telefone", v)}
                  isRequired
                />
              </div>

              <Input
                label="E-mail (opcional)"
                value={dados.email}
                onValueChange={(v) => updateCampo("email", v)}
              />
              <Input
                label="Referência (opcional)"
                value={dados.referencia}
                onValueChange={(v) => updateCampo("referencia", v)}
              />

              {erro ? (
                <p className="text-sm text-danger" role="alert">
                  {erro}
                </p>
              ) : null}

              <div className="flex gap-2 justify-end w-full pt-2">
                <Button variant="light" onPress={() => router.back()} isDisabled={enviando}>
                  Cancelar
                </Button>
                <Button color="primary" type="submit" isLoading={enviando}>
                  Cadastrar empresa
                </Button>
              </div>
            </Form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
